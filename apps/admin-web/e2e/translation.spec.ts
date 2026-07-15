import { expect, test } from "@playwright/test";
import { login, mockAuth, project } from "./support/phase-fixtures";

test("Translation Queue preserves URL filters and separates draft/review actions", async ({ page }) => {
  await mockAuth(page);
  let editCalls = 0;
  let retranslateCalls = 0;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [project] }) }));
  await page.route("**/api/v1/translation-queue**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 7, project_id: 1, issue_id: "issue-1", target_type: "issue", target_field: "summary", review_status: "ai_draft", source_text: "Original", ai_draft: "Bản gốc", reviewed_text: "Reviewed existing", provider: "deepseek", model_or_command: "deepseek-v4-flash", provider_error: "provider retry available" }] }) }));
  await page.route("**/api/v1/translation-queue/7/manual-edit", async (route) => { editCalls += 1; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: 7, review_status: "edited" } }) }); });
  await page.route("**/api/v1/translation-queue/7/retranslate", async (route) => { retranslateCalls += 1; return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: 7, reused: retranslateCalls === 1, job: { id: `queue-job-${retranslateCalls}` } } }) }); });
  await login(page, "/translation-queue?project_id=1&review_status=ai_draft");
  await expect(page).toHaveURL(/translation-queue\?project_id=1&review_status=ai_draft/);
  await expect(page.getByRole("heading", { name: "Review queue" })).toBeVisible();
  const queueTable = page.locator('section[aria-labelledby="queue-list-heading"] table');
  await expect(queueTable).toHaveClass(/translation-queue-table/);
  const columnLayout = await queueTable.locator("thead th").evaluateAll((headers) => headers.map((header) => {
    const rect = header.getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width };
  }));
  expect(columnLayout).toHaveLength(9);
  expect(columnLayout.every((column) => column.width > 0)).toBe(true);
  for (let index = 1; index < columnLayout.length; index += 1) {
    expect(columnLayout[index].left).toBeGreaterThanOrEqual(columnLayout[index - 1].right - 1);
  }
  await expect(queueTable.locator(".translation-queue-text").first()).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("Bản gốc");
  await expect(page.locator("tbody tr").first()).toContainText("Reviewed existing");
  await expect(page.getByText("provider retry available")).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit reviewed translation" });
  await expect(editDialog).toBeVisible();
  await expect(editDialog.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Save reviewed text" })).toBeVisible();
  await page.getByLabel("Reviewed text").fill("Reviewed by operator");
  await page.getByRole("button", { name: "Save reviewed text" }).click();
  await expect.poll(() => editCalls).toBe(1);
  await expect(page.getByRole("dialog", { name: "Edit reviewed translation" })).not.toBeVisible();
  await page.getByRole("button", { name: "Retranslate" }).click();
  await expect(page.getByText("Retranslate job already active; reused (queue-job-1).")).toBeVisible();
  await page.getByRole("button", { name: "Retranslate" }).click();
  await expect(page.getByText("Retranslate job queued (queue-job-2).")).toBeVisible();
});

test("Translation Queue exposes empty retry and keeps URL filters", async ({ page }) => {
  await mockAuth(page);
  let queueCalls = 0;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [project] }) }));
  await page.route("**/api/v1/translation-queue**", (route) => { queueCalls += 1; return route.fulfill({ status: queueCalls === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify(queueCalls === 1 ? { error: { code: "QUEUE_UNAVAILABLE", message: "Queue temporarily unavailable." } } : { data: [] }) }); });
  await login(page, "/translation-queue?project_id=1&review_status=pending");
  await expect(page.getByText("Queue temporarily unavailable.")).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page).toHaveURL(/translation-queue\?project_id=1&review_status=pending/);
  await expect(page.getByText("No translation queue items")).toBeVisible();
  expect(queueCalls).toBe(2);
});
