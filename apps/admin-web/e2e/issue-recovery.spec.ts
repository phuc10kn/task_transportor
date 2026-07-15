import { expect, test } from "@playwright/test";
import { login, mockAuth, project } from "./support/phase-fixtures";

test("CIS recovery preserves identity input on conflict and reports resync timeout", async ({ page }) => {
  await mockAuth(page);
  let identityCalls = 0;
  let linked = false;
  const editor = { issue: { id: "issue-recovery", project_id: 1, backlog_issue_key: null, jira_issue_key: null, sync_status: "synced", updated_at: "2026-07-15T00:00:00Z" }, canonical: { summary: { value: "Recovery", source: "backlog" }, description: { value: "Body", source: "backlog" }, issue_type: { value: "Bug", source: "backlog" }, priority: { value: "High", source: "backlog" }, status: { value: "Open", source: "backlog" }, assignee: { value: "Tanaka", source: "backlog" }, due_date: { value: null, source: null } }, sources: {}, field_meta: { catalogs: { issue_type: ["Bug"], priority: ["High"], status: ["Open"], assignee: ["Tanaka"] }, field_types: { summary: "string", description: "text", issue_type: "single_select", priority: "single_select", status: "single_select", assignee: "user", due_date: "date" } }, translations: [], collections: { worklog_summary: { count: 0, total_spent_seconds: 0, sources: [] } }, sync: { canonical_hash: "recovery-hash" } };
  await page.route("**/api/v1/issues/issue-recovery/editor", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { ...editor, issue: { ...editor.issue, backlog_issue_key: linked ? "BLG-RECOVERY" : null } } }) }));
  await page.route("**/api/v1/issues/issue-recovery/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  await page.route("**/api/v1/issues/issue-recovery/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.route("**/api/v1/issues/issue-recovery/external-identities", async (route) => { identityCalls += 1; if (identityCalls === 1) return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: { code: "IDENTITY_CONFLICT", message: "Identity is already linked." } }) }); linked = true; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { issue_id: "issue-recovery" } }) }); });
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-RECOVERY/pull", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: "timeout-job", status: "queued" } }) }));
  await page.route("**/api/v1/sync-jobs/timeout-job", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "timeout-job", status: "timeout" } }) }));
  await login(page, "/cis-issues/issue-recovery");
  await expect(page.getByRole("heading", { name: "Editable fields" })).toBeVisible();
  await page.getByLabel("Backlog issue key").fill("BLG-NEW");
  await page.getByRole("button", { name: "Verify and link" }).click();
  await expect(page.getByText("Identity is already linked.")).toBeVisible();
  await expect(page.getByLabel("Backlog issue key")).toHaveValue("BLG-NEW");
  await page.getByRole("button", { name: "Verify and link" }).click();
  await expect.poll(() => identityCalls).toBe(2);
  await page.getByRole("button", { name: "Resync from Backlog" }).click();
  await expect(page.getByText("Job timeout-job · timeout")).toBeVisible();
});
