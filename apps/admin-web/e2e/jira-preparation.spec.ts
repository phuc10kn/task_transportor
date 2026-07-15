import { expect, Page, test } from "@playwright/test";
import { login, mockAuth } from "./support/phase-fixtures";

const issueId = "issue-jira";
const editor = {
  issue: { id: issueId, project_id: 1, backlog_issue_key: "BLG-77", jira_issue_key: null, sync_status: "approved", updated_at: "2026-07-15T00:00:00Z" },
  canonical: { summary: { value: "Canonical summary", source: "cis" }, description: { value: "Canonical body", source: "cis" }, issue_type: { value: "Task", source: "cis" }, priority: { value: "High", source: "cis" }, status: { value: "Open", source: "cis" }, assignee: { value: "operator@example.test", source: "cis" }, due_date: { value: "2026-08-01", source: "cis" } },
  sources: {},
  field_meta: {
    catalogs: { issue_type: ["Task"], priority: ["High"], status: ["Open"], assignee: ["operator@example.test"] },
    catalogs_by_system: { jira: { issue_type: ["Bug", "Task"], priority: ["Highest", "High"], status: ["To Do", "Done"], assignee: ["jira-account"] } },
    field_types: { summary: "string", description: "text", issue_type: "single_select", priority: "single_select", status: "single_select", assignee: "user", due_date: "date" },
  },
  translations: [], collections: { worklog_summary: { count: 0, total_spent_seconds: 0, sources: [] } }, sync: { canonical_hash: "editor-hash" },
};

function dryRun({ canSync = true, summary = "Dry-run summary" } = {}) {
  return {
    issue_id: issueId, target: "jira", mode: "dry_run", can_sync: canSync, stale: false, canonical_hash: "sha256:dry-run-hash",
    field_sources: { summary: "cis", description: "cis", issue_type: "cis", priority: "cis", status: "cis", assignee: "cis", due_date: "cis" },
    payload: { operation: "create", fields: { project: { key: "WEC" }, summary, description: "Dry-run body", issuetype: { name: "Bug" }, priority: { name: "Highest" }, assignee: { accountId: "jira-account" }, duedate: "2026-08-02" }, transition_preview: { status: "To Do" } },
    validation: { errors: canSync ? [] : [{ code: "MAPPING_REQUIRED", message: "Required Jira mapping is missing.", details: { mapping_type: "status" } }], missing_required_mapping: canSync ? [] : [{ mapping_type: "status" }], blocking_anomalies: [] },
    warnings: [{ code: "ASSIGNEE_MAPPING_NOT_READY", message: "Assignee mapping is missing." }],
  };
}

async function setupEditor(page: Page, onEditor = () => {}) {
  await mockAuth(page);
  await page.route(`**/api/v1/issues/${issueId}/editor`, (route) => { onEditor(); return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: editor }) }); });
  await page.route(`**/api/v1/issues/${issueId}/history`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  await page.route(`**/api/v1/issues/${issueId}/attachments`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
}

test("Jira preparation renders blocked dry-run evidence and uses Jira catalogs", async ({ page }) => {
  await setupEditor(page);
  await page.route(`**/api/v1/issues/${issueId}/dry-run/jira`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: dryRun({ canSync: false }) }) }));
  await login(page, `/cis-issues/${issueId}`);
  await page.getByRole("button", { name: "Prepare Jira sync" }).click();
  const dialog = page.getByRole("dialog", { name: "Jira preparation" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Blocked", { exact: true })).toBeVisible();
  await expect(dialog.getByText("MAPPING_REQUIRED")).toBeVisible();
  await expect(dialog.getByText("ASSIGNEE_MAPPING_NOT_READY")).toBeVisible();
  await expect(dialog.getByText("sha256:dry-run-hash")).toBeVisible();
  await expect(dialog.getByLabel("Jira issue type").locator("option")).toHaveText(["Select issue type", "Bug", "Task"]);
  await expect(dialog.getByLabel("Jira priority").locator("option")).toHaveText(["Select priority", "Highest", "High"]);
  await expect(dialog.getByLabel("Jira status").locator("option")).toHaveText(["Select status", "To Do", "Done"]);
  await expect(dialog.getByRole("button", { name: "Sync Jira" })).toBeDisabled();
  await dialog.getByText("Payload preview").click();
  await expect(dialog.getByText(/Dry-run summary/)).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  await page.getByLabel("Summary").fill("Unsaved canonical");
  await expect(page.getByRole("button", { name: "Prepare Jira sync" })).toBeDisabled();
});

test("Jira preparation preserves overrides on stale sync then polls queued job to success", async ({ page }) => {
  let editorCalls = 0;
  await setupEditor(page, () => { editorCalls += 1; });
  let dryRunCalls = 0;
  let syncCalls = 0;
  let syncBody: Record<string, unknown> | null = null;
  let jobCalls = 0;
  await page.route(`**/api/v1/issues/${issueId}/dry-run/jira`, (route) => { dryRunCalls += 1; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: dryRun({ summary: `Dry-run summary ${dryRunCalls}` }) }) }); });
  await page.route(`**/api/v1/issues/${issueId}/sync/jira`, async (route) => {
    syncCalls += 1; syncBody = route.request().postDataJSON() as Record<string, unknown>;
    if (syncCalls === 1) return route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: { code: "DRY_RUN_STALE", message: "Run Jira dry-run again before syncing this issue.", details: { latest_dry_run_journal_id: 17, canonical_hash: "sha256:new" } } }) });
    return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: "jira-job", status: "queued" } }) });
  });
  await page.route("**/api/v1/sync-jobs/jira-job", (route) => { jobCalls += 1; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "jira-job", status: jobCalls === 1 ? "running" : "success" } }) }); });
  await login(page, `/cis-issues/${issueId}`);
  await page.getByRole("button", { name: "Prepare Jira sync" }).click();
  const dialog = page.getByRole("dialog", { name: "Jira preparation" });
  await expect(dialog.getByLabel("Jira summary")).toHaveValue("Dry-run summary 1");
  await dialog.getByLabel("Jira summary").fill("Operator override");
  await page.evaluate(() => window.dispatchEvent(new Event("cis-global-refresh")));
  await expect(dialog.getByLabel("Jira summary")).toHaveValue("Operator override");
  expect(editorCalls).toBe(1);
  await dialog.getByRole("button", { name: "Dry-run again" }).click();
  await expect(dialog.getByText("Replace edited Jira fields?")).toBeVisible();
  await dialog.getByRole("button", { name: "Keep edits" }).click();
  await expect(dialog.getByLabel("Jira summary")).toHaveValue("Operator override");
  await dialog.getByRole("button", { name: "Sync Jira" }).click();
  await expect(dialog.getByText("DRY_RUN_STALE")).toBeVisible();
  await expect(dialog.getByLabel("Jira summary")).toHaveValue("Operator override");
  await expect(dialog.getByRole("button", { name: "Sync Jira" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Dry-run again" }).click();
  await dialog.getByRole("button", { name: "Replace and dry-run" }).click();
  await expect(dialog.getByLabel("Jira summary")).toHaveValue("Dry-run summary 2");
  await dialog.getByLabel("Jira summary").fill("Published override");
  await dialog.getByLabel("Jira description").fill("Published body");
  await dialog.getByLabel("Jira issue type").selectOption("Task");
  await dialog.getByLabel("Jira priority").selectOption("High");
  await dialog.getByLabel("Jira status").selectOption("Done");
  await dialog.getByLabel("Jira assignee").fill("jira-user@example.test");
  await dialog.getByLabel("Jira due date").fill("2026-08-15");
  await dialog.getByRole("button", { name: "Sync Jira" }).click();
  await expect(dialog.getByText("jira-job · success")).toBeVisible();
  expect((syncBody as { jira_fields?: Record<string, string> } | null)?.jira_fields).toEqual({ summary: "Published override", description: "Published body", issue_type: "Task", priority: "High", status: "Done", assignee: "jira-user@example.test", due_date: "2026-08-15" });
});

test("Jira preparation keeps modal context when initial dry-run fails and retries", async ({ page }) => {
  await setupEditor(page);
  let calls = 0;
  await page.route(`**/api/v1/issues/${issueId}/dry-run/jira`, (route) => { calls += 1; return calls === 1 ? route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "JIRA_UNAVAILABLE", message: "Jira pre-check unavailable." } }) }) : route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: dryRun() }) }); });
  await login(page, `/cis-issues/${issueId}`);
  await page.getByRole("button", { name: "Prepare Jira sync" }).click();
  const dialog = page.getByRole("dialog", { name: "Jira preparation" });
  await expect(dialog.getByText("Jira pre-check unavailable.")).toBeVisible();
  await dialog.getByRole("button", { name: "Retry dry-run" }).click();
  await expect(dialog.getByLabel("Jira summary")).toHaveValue("Dry-run summary");
  await expect(dialog.getByRole("button", { name: "Sync Jira" })).toBeEnabled();
});

test("Jira queued job exposes client timeout without claiming completion", async ({ page }) => {
  await setupEditor(page);
  await page.route(`**/api/v1/issues/${issueId}/dry-run/jira`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: dryRun() }) }));
  await page.route(`**/api/v1/issues/${issueId}/sync/jira`, (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: "jira-timeout", status: "queued" } }) }));
  await page.route("**/api/v1/sync-jobs/jira-timeout", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "jira-timeout", status: "queued" } }) }));
  await login(page, `/cis-issues/${issueId}`);
  await page.getByRole("button", { name: "Prepare Jira sync" }).click();
  const dialog = page.getByRole("dialog", { name: "Jira preparation" });
  await dialog.getByRole("button", { name: "Sync Jira" }).click();
  await expect(dialog.getByText("jira-timeout · timeout")).toBeVisible({ timeout: 25000 });
  await expect(dialog.getByText("success", { exact: true })).toHaveCount(0);
});
