import { expect, test } from "@playwright/test";
import { login, mockAuth, project } from "./support/phase-fixtures";

test("CIS Issues editor keeps canonical, identity, recovery and translation evidence", async ({ page }) => {
  await mockAuth(page);
  let saveCalls = 0;
  let saveBody: Record<string, unknown> | null = null;
  let resyncCalls = 0;
  let attachmentRetryCalls = 0;
  let translationCalls = 0;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [project] }) }));
  await page.route("**/api/v1/issues?project_id=1", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: "issue-1", project_id: 1, backlog_issue_key: "BLG-1", sync_status: "synced", current_summary: "Original" }] }) }));
  await page.route("**/api/v1/issues/issue-1/editor", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { issue: { id: "issue-1", project_id: 1, backlog_issue_key: "BLG-1", jira_issue_key: null, sync_status: "synced", current_revision: 2, updated_at: "2026-07-15T00:00:00Z" }, canonical: { summary: { value: "Original", source: "backlog" }, description: { value: "Body", source: "backlog" }, issue_type: { value: "Bug", source: "backlog" }, priority: { value: "High", source: "backlog" }, status: { value: "Open", source: "backlog" }, assignee: { value: "Tanaka", source: "backlog" }, due_date: { value: null, source: null } }, sources: { summary: { backlog: "Original", cis: "Original", jira: null } }, assignee_meta: { cis: { jira_account_id: null } }, field_meta: { catalogs: { issue_type: ["Bug"], priority: ["High"], status: ["Open"], assignee: ["Tanaka"] }, field_types: { summary: "string", description: "text", issue_type: "single_select", priority: "single_select", status: "single_select", assignee: "user", due_date: "date" } }, collections: { worklog_summary: { count: 1, total_spent_seconds: 60, sources: ["backlog"] } }, translation: { total: 2, pending: 2, approved: 0 }, translations: [{ id: 7, target_type: "issue", target_field: "summary", source_text: "Original", ai_draft: "Original", reviewed_text: null, review_status: "ai_draft" }, { id: 8, target_type: "issue", target_field: "description", source_text: "Changed source\nSecond line\n\nThird paragraph", ai_draft: "Old draft", reviewed_text: "Old reviewed", review_status: "ai_draft", is_source_stale: true }], sync: { canonical_hash: "hash-1" } } }) }));
  await page.route("**/api/v1/issues/issue-1/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [{ id: "edit-1", action: "manual_edit", created_at: "2026-07-15T01:00:00Z", details_json: { reason: "historical reason" } }] } }) }));
  await page.route("**/api/v1/issues/issue-1/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 9, filename: "spec.pdf", download_status: "ready" }] }) }));
  await page.route(/\/api\/v1\/issues\/issue-1$/, async (route) => { if (route.request().method() === "PATCH") { saveCalls += 1; saveBody = route.request().postDataJSON() as Record<string, unknown>; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { canonical: {} } }) }); } return route.continue(); });
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-1/pull", async (route) => { resyncCalls += 1; return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: "recovery-job", status: "queued" } }) }); });
  await page.route("**/api/v1/sync-jobs/recovery-job", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "recovery-job", status: "success" } }) }));
  await page.route("**/api/v1/attachments/9/retry-download", async (route) => { attachmentRetryCalls += 1; if (attachmentRetryCalls > 1) return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: { code: "ATTACHMENT_BUSY", message: "Attachment retry already running." } }) }); return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: 9, status: "queued" } }) }); });
  await page.route("**/api/v1/translations/issues/issue-1/translate", async (route) => { translationCalls += 1; return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { execution_status: "queued", queued_job_ids: ["translation-job"] } }) }); });
  await page.route("**/api/v1/translations/issues/issue-1/items/8/translate", async (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { execution_status: "queued", queued_job_ids: ["translation-item-job"] } }) }));
  await login(page, "/cis-issues?project_id=1");
  await expect(page.getByRole("heading", { name: "Issue workspace" })).toBeVisible();
  const issueTable = page.locator('section[aria-labelledby="cis-list-heading"] table');
  await expect(issueTable).toHaveClass(/cis-issue-table/);
  await expect(issueTable.locator(".cis-issue-summary").first()).toBeVisible();
  await page.getByRole("link", { name: "Open editor" }).click();
  await expect(page.getByRole("heading", { name: "Editable fields" })).toBeVisible();
  await expect(page.getByText("Source comparison")).toBeVisible();
  await expect(page.getByText("Attachments")).toBeVisible();
  const sourceTable = page.locator('section[aria-labelledby="source-heading"] table');
  await expect(sourceTable).toHaveClass(/source-comparison-table/);
  await expect(sourceTable.locator(".source-comparison-value").first()).toHaveCSS("white-space", "pre-wrap");
  await expect(page.getByText("Translations")).toBeVisible();
  const descriptionTranslation = page.locator("article").filter({ hasText: "Changed source" }).first();
  await expect(descriptionTranslation.locator(".translation-source-text")).toContainText("Second line");
  await expect(descriptionTranslation.locator(".translation-source-text")).toHaveCSS("white-space", "pre-wrap");
  await expect(page.getByText("Worklogs")).toBeVisible();
  await expect(page.getByText("1 · 60s · backlog")).toBeVisible();
  await expect(page.getByText("hash-1")).toBeVisible();
  await expect(page.getByText("History")).toBeVisible();
  await expect(page.getByText("historical reason")).toBeVisible();
  await expect(page.getByText("2026-07-15T00:00:00Z")).toBeVisible();
  await expect(page.getByLabel("Jira account ID")).toHaveValue("");
  for (const field of ["Summary", "Description", "Issue type", "Priority", "Status", "Assignee", "Due date"]) await expect(page.getByLabel(field)).toBeVisible();
  await expect(page.getByText("Read-only source evidence")).toBeVisible();
  await expect(page.locator('section[aria-labelledby="source-heading"] input, section[aria-labelledby="source-heading"] textarea, section[aria-labelledby="source-heading"] select')).toHaveCount(0);
  await expect(page.getByText("Draft matches source text")).toBeVisible();
  await expect(page.getByText("source stale")).toBeVisible();
  await expect(page.getByLabel("Translation 8")).toBeDisabled();
  await expect(page.getByLabel("Issue type")).toHaveValue("Bug");
  await expect(page.getByLabel("Issue type").locator("option")).toHaveText(["Select issue type", "Bug"]);
  await expect(page.getByLabel("Backlog issue key")).toBeDisabled();
  await page.getByRole("button", { name: "Resync from Backlog" }).click();
  await expect(page.getByText("Job recovery-job · success")).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect.poll(() => attachmentRetryCalls).toBe(1);
  await page.getByLabel("Reason").fill("historical reason");
  await page.getByLabel("Summary").fill("Changed summary");
  await expect(page.getByText("Unsaved", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Resync from Backlog" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Translate issue" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Verify and link" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Retry" })).toBeEnabled();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Attachment retry already running.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save canonical" }).click();
  await expect.poll(() => saveCalls).toBe(1);
  expect((saveBody as Record<string, unknown> | null)?.reason).toBe("historical reason");
  await expect(page.getByLabel("Summary")).toHaveValue("Original");
  await expect(page.getByText("Unsaved", { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: "Translate issue" }).click();
  await expect.poll(() => translationCalls).toBe(1);
  await expect(page.getByText("Translation queued (translation-job); review Translation Queue.")).toBeVisible();
  await page.getByRole("button", { name: "Retranslate" }).last().click();
  await expect(page.getByText("Retranslate queued (translation-item-job); review Translation Queue.")).toBeVisible();
  expect(resyncCalls).toBe(1);
});

test("CIS editor preserves a synced canonical value missing from the active catalog", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/issues?project_id=1", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: "issue-mismatch", project_id: 1, backlog_issue_key: "BLG-MISMATCH", sync_status: "synced", current_summary: "Backlog issue" }] }) }));
  await page.route("**/api/v1/issues/issue-mismatch/editor", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: {
    issue: { id: "issue-mismatch", project_id: 1, backlog_issue_key: "BLG-MISMATCH", jira_issue_key: null, sync_status: "synced", updated_at: "2026-07-15T00:00:00Z" },
    canonical: {
      summary: { value: "Backlog issue", source: "backlog" }, description: { value: "Body", source: "backlog" },
      issue_type: { value: "調査", source: "backlog" }, priority: { value: "Normal", source: "backlog" },
      status: { value: "調査中", source: "backlog" }, assignee: { value: "tuangiang.vu10kn", source: "backlog" }, due_date: { value: null, source: null },
    },
    sources: {}, assignee_meta: { cis: { jira_account_id: null } },
    field_meta: { catalogs: { issue_type: ["Task"], priority: ["Medium"], status: ["Resolved"], assignee: ["jira-account"] }, field_types: { summary: "string", description: "text", issue_type: "single_select", priority: "single_select", status: "single_select", assignee: "user", due_date: "date" } },
    translations: [], collections: { worklog_summary: { count: 0, total_spent_seconds: 0, sources: [] } }, sync: { canonical_hash: "mismatch-hash" },
  } }) }));
  await page.route("**/api/v1/issues/issue-mismatch/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  await page.route("**/api/v1/issues/issue-mismatch/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));

  await login(page, "/cis-issues?project_id=1");
  await page.getByRole("link", { name: "Open editor" }).click();
  await expect(page.getByLabel("Issue type")).toHaveValue("調査");
  await expect(page.getByLabel("Issue type").locator("option").nth(1)).toHaveText("調査 (current; not in catalog)");
  await expect(page.getByText("Current value is not in the active catalog.").first()).toBeVisible();
  await expect(page.getByLabel("Priority")).toHaveValue("Normal");
  await expect(page.getByLabel("Status")).toHaveValue("調査中");
  await expect(page.getByLabel("Assignee")).toHaveValue("tuangiang.vu10kn");
});

test("CIS issue list supports create and retry without losing route context", async ({ page }) => {
  await mockAuth(page);
  let issueCalls = 0;
  let createBody: Record<string, unknown> | null = null;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [project] }) }));
  await page.route("**/api/v1/issues?project_id=1", (route) => { issueCalls += 1; return route.fulfill({ status: issueCalls === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify(issueCalls === 1 ? { error: { code: "CIS_UNAVAILABLE", message: "CIS list temporarily unavailable." } } : { data: [] }) }); });
  await page.route("**/api/v1/issues", async (route) => { if (route.request().method() !== "POST") return route.continue(); createBody = route.request().postDataJSON() as Record<string, unknown>; return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ data: { issue: { id: "issue-created", project_id: 1 } } }) }); });
  await login(page, "/cis-issues?project_id=1");
  await expect(page.getByText("CIS list temporarily unavailable.")).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("No CIS issues found")).toBeVisible();
  await page.getByLabel("Issue summary").fill("Created from browser");
  await page.getByLabel("Issue description").fill("Description");
  await page.getByRole("button", { name: "Create issue" }).click();
  await expect.poll(() => createBody).not.toBeNull();
  expect(createBody).toMatchObject({ project_id: 1, summary: "Created from browser", description: "Description" });
});
