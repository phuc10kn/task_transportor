import { expect, test } from "@playwright/test";
import { login, mockAuth, project } from "./support/phase-fixtures";

test("Backlog actions disable project pull and keep independent row context", async ({ page }) => {
  await mockAuth(page);
  let candidateCalls = 0;
  let projectPullCalls = 0;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ ...project, backlog_issue_key_prefix: "BLG" }] }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true }, pull_one: { enabled: true, execution_mode: "async", consumer_ready: true }, pull_project: { enabled: true, execution_mode: "async", consumer_ready: true }, sync_to_cis: { enabled: true, execution_mode: "async", consumer_ready: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, statuses: [], assignees: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/pull", async (route) => {
    expect(new URL(route.request().url()).search).toBe("");
    projectPullCalls += 1;
    return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: projectPullCalls === 1 ? { enqueued: 2, jobs: [{ id: "job-project", status: "pending" }] } : { enqueued: 0, jobs: [] } }) });
  });
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-1/pull", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: "job-one", status: "success" } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-1/sync-to-cis", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { outcome: "queued", issue_id: null, job: { id: "job-sync", status: "pending" }, with_translation: false } }) }));
  await page.route("**/api/v1/sync-jobs/job-project", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "job-project", status: "success" } }) }));
  await page.route("**/api/v1/sync-jobs/job-sync", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "job-sync", status: "success", issue_id: "cis-1" } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => { candidateCalls += 1; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-1", summary: "Candidate", status: "Open", assignee: null, created_at_source: "2026-07-15T00:00:00Z", updated_at_source: "2026-07-15T00:00:00Z" }], filters: { created_from: "2026-07-15", created_to: "2026-07-15", limit: 20, status_ids: [], assignee_ids: [], not_closed: false }, meta: { requested_limit: 20, returned_count: 1, source_rows_scanned: 1, excluded_existing_cis_count: 0, pages_scanned: 1, source_exhausted: true, scan_limit_reached: false, deadline_reached: false, stop_reason: "source_exhausted", provider_error_code: null } } }) }); });
  await login(page, "/backlog-issues?project_id=1");
  await expect(page.getByRole("button", { name: "Pull project" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Pull project" })).toHaveAttribute("title", "Temporarily disabled during UI replatforming.");
  await page.getByRole("button", { name: "Pull one" }).click();
  await expect(page.getByLabel("Pull one issue key")).toHaveValue("BLG-1");
  await expect(page.getByText("Job job-one: success")).toBeVisible();
  await page.getByRole("button", { name: "Find issues" }).click();
  await expect(page.getByRole("cell", { name: "BLG-1" })).toBeVisible();
  await page.getByRole("button", { name: "Sync to CIS", exact: true }).click();
  await expect(page.getByText("Job job-sync: success")).toBeVisible();
  expect(candidateCalls).toBeGreaterThanOrEqual(2);
  expect(projectPullCalls).toBe(0);
});

test("Backlog candidate actions isolate rows and explain existing sync without translation", async ({ page }) => {
  await mockAuth(page);
  let syncCalls = 0;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ ...project, backlog_issue_key_prefix: "BLG" }] }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: true }, sync_to_cis: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, statuses: [], assignees: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-1", summary: "First", status: "Open", assignee: null }, { backlog_issue_key: "BLG-2", summary: "Second", status: "Open", assignee: null }, { backlog_issue_key: "BLG-3", summary: "Existing active sync", status: "Open", assignee: null }], filters: { created_from: "2026-07-15", created_to: "2026-07-15", limit: 20, status_ids: [], assignee_ids: [], not_closed: false }, meta: { requested_limit: 20, returned_count: 3, source_rows_scanned: 3, excluded_existing_cis_count: 0, pages_scanned: 1, source_exhausted: true, scan_limit_reached: false, deadline_reached: false, stop_reason: "source_exhausted", provider_error_code: null } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-1/sync-to-cis", async (route) => { syncCalls += 1; return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { outcome: "queued", job: { id: "row-job", status: "running" } } }) }); });
  await page.route("**/api/v1/sync-jobs/row-job", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "row-job", status: "running" } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-2/sync-to-cis", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { outcome: "queued", job: { id: "translated-job", status: "queued" }, with_translation: true } }) }));
  await page.route("**/api/v1/sync-jobs/translated-job", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "translated-job", status: "success" } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-3/sync-to-cis", (route) => route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: { code: "BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION", message: "An active CIS sync exists without translation.", details: { job_id: "existing-job", status: "running" } } }) }));
  await page.route("**/api/v1/sync-jobs/existing-job", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "existing-job", status: "running" } }) }));
  await login(page, "/backlog-issues?project_id=1");
  await page.getByRole("button", { name: "Find issues" }).click();
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(3);
  await rows.nth(0).getByRole("button", { name: "Sync to CIS", exact: true }).click();
  await expect(rows.nth(0).getByRole("button", { name: "running…" })).toBeDisabled();
  await expect(rows.nth(0).getByRole("button", { name: "Action locked" })).toBeDisabled();
  await expect(rows.nth(1).getByRole("button", { name: "Sync to CIS", exact: true })).toBeEnabled();
  await expect(rows.nth(1).getByRole("button", { name: "Sync to CIS + Translate" })).toBeEnabled();
  expect(syncCalls).toBe(1);
  await rows.nth(1).getByRole("button", { name: "Sync to CIS + Translate" }).click();
  await expect(rows.nth(1).getByText("CIS sync completed; review Translation Queue")).toBeVisible();
  await rows.nth(2).getByRole("button", { name: "Sync to CIS", exact: true }).click();
  await expect(rows.nth(2).getByText("Translation was not queued. Open Issue Editor → Translate for this item.")).toBeVisible();
});

test("Backlog new search invalidates an in-flight candidate action", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ ...project, backlog_issue_key_prefix: "BLG" }] }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true }, sync_to_cis: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, statuses: [], assignees: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-STALE", summary: "Stale action", status: "Open", assignee: null }], filters: { created_from: "2026-07-15", created_to: "2026-07-15", limit: 20, status_ids: [], assignee_ids: [], not_closed: false }, meta: { requested_limit: 20, returned_count: 1, source_rows_scanned: 1, excluded_existing_cis_count: 0, pages_scanned: 1, source_exhausted: true, scan_limit_reached: false, deadline_reached: false, stop_reason: "source_exhausted", provider_error_code: null } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-STALE/sync-to-cis", async (route) => { await new Promise((resolve) => setTimeout(resolve, 500)); return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { outcome: "queued", job: { id: "stale-job", status: "running" } } }) }); });
  await login(page, "/backlog-issues?project_id=1");
  await page.getByRole("button", { name: "Find issues" }).click();
  await expect(page.getByRole("cell", { name: "BLG-STALE" })).toBeVisible();
  await page.getByRole("button", { name: "Sync to CIS", exact: true }).click();
  await page.getByRole("button", { name: "Find issues" }).click();
  await expect(page.getByRole("cell", { name: "BLG-STALE" })).toBeVisible();
  await expect(page.getByText("Job stale-job: running")).not.toBeVisible();
});
