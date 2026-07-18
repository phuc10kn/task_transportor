"use strict";

const { expect, test } = require("@playwright/test");

const project = { id: 1, name: "Demo Hub", enabled: true, source_language: "ja", target_language: "vi", backlog_issue_key_prefix: "BLG", access: { team_role: "lead", is_owner: true } };
const workspace = (path, projectId = 1) => path.startsWith("/project/") || path.startsWith("/projects") ? path : `/project/${projectId}${path}`;

async function mockSession(page, projects = [project]) {
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "mpa-token", user: { id: 1, email: "admin@example.test", system_role: "system_admin" } } }) }));
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { user: { id: 1, email: "admin@example.test", system_role: "system_admin" } } }) }));
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: projects }) }));
  await page.route("**/api/v1/projects/1/team", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: 1, project_id: 1, owner_user_id: 1, members: [{ id: 1, email: "admin@example.test", role: "lead", is_owner: true }] } }) }));
}

async function enter(page, path, projects = [project]) {
  await mockSession(page, projects);
  await page.addInitScript(({ path }) => {
    localStorage.setItem("cis_user_token", "mpa-token");
    sessionStorage.setItem("cis_active_project_id", "1");
    window.__expectedPath = path;
  }, { path });
  await page.goto(workspace(path));
}

test("real URL navigation: login, Project gate and full-document routes", async ({ page }) => {
  await mockSession(page);
  const legacy = await page.goto("/backlog-issues");
  expect(legacy.status()).toBe(404);
  await page.goto(workspace("/backlog-issues"));
  await expect(page).toHaveURL(/\/login\?next=%2Fproject%2F1%2Fbacklog-issues/);
  await page.getByLabel("Email").fill("admin@example.test");
  await page.getByLabel("Password").fill("secret");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/project\/1\/backlog-issues$/);
  await expect(page.getByText("Demo Hub · #1")).toBeVisible();
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  const lightSidebar = await page.locator(".navbar-vertical").evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.locator(".navbar-vertical").evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(lightSidebar);
});

test("Project form exposes provider-specific external access gates", async ({ page }) => {
  await enter(page, "/projects?project_id=1");
  await expect(page.getByRole("checkbox", { name: "Allow external reads" }).first()).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Allow external reads" }).nth(1)).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Allow external writes" })).not.toBeChecked();
  await page.getByLabel("Provider").selectOption("openai");
  await expect(page.getByLabel("Transport")).toHaveValue("openai_compatible");
  await expect(page.getByLabel("Model")).toHaveValue("gpt-4.1-mini");
  await expect(page.getByLabel("Model").locator("option")).toHaveCount(5);
  await expect(page.getByLabel("Model")).toHaveText(/gpt-5\.4-mini/);
  await expect(page.getByLabel("Model")).toHaveText(/gpt-5\.6-luna/);
  await expect(page.getByLabel("Model")).toHaveText(/gpt-5\.6-terra/);
  await expect(page.getByLabel("Model")).toHaveText(/gpt-5\.6-sol/);
  await page.getByLabel("Model").selectOption("gpt-5.6-terra");
  await expect(page.getByLabel("Model")).toHaveValue("gpt-5.6-terra");
  await expect(page.getByText(/OPENAI_API_KEY/)).toBeVisible();
});

test("dashboard renders only the active Project workload and actionable links", async ({ page }) => {
  let summaryRequests = 0;
  let alertRequests = 0;
  let alerts = [
    { type: "sync_job_failed", severity: "warning", id: "job-1", project_id: 1, issue_id: "issue-1", job_type: "push_issue", last_error: "Jira timeout" },
    { type: "anomaly_open", severity: "critical", id: 7, project_id: 1, issue_id: "issue-2", anomaly_type: "mapping_gap", status: "open" },
  ];
  await page.route("**/api/v1/projects/1/dashboard/summary", (route) => {
    summaryRequests += 1;
    if (summaryRequests === 1) return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "DASHBOARD_TEMPORARY", message: "Dashboard read model is temporarily unavailable." } }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { health: { status: "ok", database: "ok" }, counts: { pull_jobs_pending: 2, pull_jobs_failed: 1, translation_pending: 3, issue_pending_mapping: 4, sync_jobs_failed: 1, anomaly_open: 2, issues_total: 9 } } }) });
  });
  await page.route("**/api/v1/projects/1/dashboard/alerts", (route) => {
    alertRequests += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: alerts }) });
  });
  await enter(page, "/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard unavailable" })).toBeVisible();
  await page.getByRole("link", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Dashboard" })).toHaveClass(/active/);
  await expect(page.getByRole("region", { name: "Project workload" })).toContainText("Translation review3");
  await expect(page.getByRole("region", { name: "Project workload" })).toContainText("CIS issues9");
  await expect(page.getByRole("heading", { name: "Alerts requiring attention" })).toBeVisible();
  await expect(page.getByText("Jira timeout")).toBeVisible();
  const mappingLink = page.locator('a.btn[href="/project/1/anomalies?status=open&anomaly_type=mapping_gap"]');
  await expect(mappingLink).toHaveAttribute("href", "/project/1/anomalies?status=open&anomaly_type=mapping_gap");
  await mappingLink.focus();
  await expect(mappingLink).toBeFocused();
  expect(summaryRequests).toBe(2);
  expect(alertRequests).toBe(2);
  alerts = [];
  await page.reload();
  await expect(page.getByRole("heading", { name: "No active alerts" })).toBeVisible();
  expect(summaryRequests).toBe(3);
  expect(alertRequests).toBe(3);
});

test("projectId in the document path overrides the remembered Project", async ({ page }) => {
  const secondProject = { ...project, id: 2, name: "Second Hub" };
  await mockSession(page, [project, secondProject]);
  await page.route("**/api/v1/projects/2/dashboard/summary", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { health: { status: "ok" }, counts: { issues_total: 2 } } }) }));
  await page.route("**/api/v1/projects/2/dashboard/alerts", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.addInitScript(() => {
    localStorage.setItem("cis_user_token", "mpa-token");
    sessionStorage.setItem("cis_active_project_id", "1");
  });
  await page.goto("/project/2/dashboard");
  await expect(page.getByText("Second Hub · #2")).toBeVisible();
  await expect(page.getByRole("region", { name: "Project workload" })).toContainText("CIS issues2");
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("cis_active_project_id"))).toBe("2");
});

test("sidebar groups Issues and Translation routes", async ({ page }) => {
  await page.route("**/api/v1/projects/1/issues**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.route("**/api/v1/projects/1/translation-queue**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await enter(page, "/cis-issues");

  const issues = page.locator('details[data-nav-group="issues"]');
  const translation = page.locator('details[data-nav-group="translation"]');
  await expect(issues).toHaveAttribute("open", "");
  await expect(issues.getByRole("link", { name: "CIS Issues" })).toHaveClass(/active/);
  await expect(issues.getByRole("link", { name: "CIS Issues" })).toHaveAttribute("aria-current", "page");
  await expect(translation).not.toHaveAttribute("open", "");

  await translation.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(translation).toHaveAttribute("open", "");
  await expect(translation.getByRole("link", { name: "Translation Queue" })).toBeVisible();
  await expect(translation.getByRole("link", { name: "Translation Glossary" })).toBeVisible();

  await translation.getByRole("link", { name: "Translation Queue" }).click();
  await expect(page).toHaveURL(/\/project\/1\/translation-queue$/);
  await expect(translation).toHaveAttribute("open", "");
  await expect(translation.getByRole("link", { name: "Translation Queue" })).toHaveAttribute("aria-current", "page");
  await expect(issues).not.toHaveAttribute("open", "");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(issues).toBeVisible();
  await expect(translation).toBeVisible();
});

test("dashboard does not fetch without an enabled active Project", async ({ page }) => {
  let dashboardRequests = 0;
  await page.route("**/api/v1/projects/*/dashboard/**", (route) => {
    dashboardRequests += 1;
    return route.abort();
  });
  await mockSession(page, []);
  await page.addInitScript(() => localStorage.setItem("cis_user_token", "mpa-token"));
  await page.goto(workspace("/dashboard"));
  await expect(page.getByRole("heading", { name: "Choose a Project first" })).toBeVisible();
  expect(dashboardRequests).toBe(0);

  await page.unroute("**/api/v1/projects");
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ ...project, enabled: false }] }) }));
  await page.evaluate(() => sessionStorage.setItem("cis_active_project_id", "1"));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Project is disabled" })).toBeVisible();
  expect(dashboardRequests).toBe(0);
});

test("backlog: explicit browse and async Sync to CIS + Translate", async ({ page }) => {
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: false, disabled_reasons: ["PROJECT_PULL_DISABLED"] }, sync_to_cis: { enabled: true }, sync_translate_jira: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [{ id: 1, name: "Open" }, { id: 2, name: "Resolved" }], assignees: [{ id: 10, name: "Chanaka" }, { id: 11, name: "D.M.Phuc" }] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-7", summary: "New customer issue", status: "Open", assignee: null, created_at_source: "2026-07-16T00:00:00Z" }], meta: { returned_count: 1, source_rows_scanned: 1, stop_reason: "source_exhausted" } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-7/sync-to-cis", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { outcome: "queued", with_translation: true, job: { id: "job-7", status: "pending" } } }) }));
  await page.route("**/api/v1/projects/1/sync-jobs/job-7", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "job-7", status: "success" } }) }));
  await enter(page, "/backlog-issues?submitted=1&created_from=2026-07-01&created_to=2026-07-16&limit=20&status_id=1&assignee_id=10");
  await expect(page.locator('select[multiple]')).toHaveCount(0);
  const statusFilter = page.getByRole("group", { name: "Status filter" });
  await expect(statusFilter).toContainText("Open");
  await expect(page.getByRole("group", { name: "Assignee filter" })).toContainText("Chanaka");
  await statusFilter.locator("summary").click();
  await statusFilter.getByRole("checkbox", { name: "Resolved" }).check();
  await statusFilter.getByRole("button", { name: "Done" }).click();
  await expect(statusFilter.locator("summary")).toContainText("Open, Resolved");
  await expect(page.getByRole("cell", { name: "BLG-7" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pull project" })).toBeDisabled();
  await expect(page.getByText("Full project pull remains disabled. Use filtered pull or candidate actions.")).toBeVisible();
  await page.getByRole("button", { name: "Sync + Translate", exact: true }).click();
  await expect(page.getByText(/Job job-7: success.*Review Translation Queue/)).toBeVisible();
});

test("backlog filtered pull queues pages sequentially and retries only the failed page", async ({ page }) => {
  let countRequests = 0;
  let countBody;
  let totalPages = 3;
  let activePageRequests = 0;
  let maxActivePageRequests = 0;
  let failPageTwo = true;
  const requestedPages = [];
  const pageBodies = [];
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: false }, sync_to_cis: { enabled: true }, sync_translate_jira: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [{ id: 1, name: "Open" }], assignees: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-11", summary: "Keep this candidate visible", status: "Open" }], meta: { returned_count: 1, source_rows_scanned: 1, stop_reason: "source_exhausted" } } }) }));
  await page.route("**/api/v1/projects/1/backlog/manual-pulls/count", (route) => {
    countRequests += 1;
    countBody = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { source_count: totalPages * 100, page_size: 100, total_pages: totalPages } }) });
  });
  await page.route("**/api/v1/projects/1/backlog/manual-pulls/pages/*", async (route) => {
    const pageNumber = Number(new URL(route.request().url()).pathname.split("/").pop());
    requestedPages.push(pageNumber);
    pageBodies.push(route.request().postDataJSON());
    activePageRequests += 1;
    maxActivePageRequests = Math.max(maxActivePageRequests, activePageRequests);
    await new Promise((resolve) => setTimeout(resolve, 10));
    activePageRequests -= 1;
    if (pageNumber === 2 && failPageTwo) {
      failPageTwo = false;
      return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "BACKLOG_TEMPORARY", message: "Backlog page temporarily unavailable." } }) });
    }
    const newlyQueued = pageNumber === 1 ? 2 : pageNumber === 2 ? 1 : 3;
    return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { page: pageNumber, source_rows: 100, newly_queued: newlyQueued, reused_active: 0, already_in_cis: 100 - newlyQueued, invalid_rows: 0 } }) });
  });

  await enter(page, "/backlog-issues?submitted=1&created_from=2026-07-01&created_to=2026-07-16&limit=20&status_id=1");
  await page.getByRole("button", { name: "Pull all matching issues" }).click();
  await expect(page.getByText("Backlog page temporarily unavailable.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "BLG-11" })).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Queueing completed · 6 issues queued.")).toBeVisible();
  await expect(page.locator("#pull-filtered-state .filtered-pull-complete")).toBeVisible();
  expect(countRequests).toBe(1);
  expect(countBody).toEqual({ created_from: "2026-07-01", created_to: "2026-07-16", status_ids: ["1"], assignee_ids: [], not_closed: false });
  expect(Object.prototype.hasOwnProperty.call(countBody, "limit")).toBe(false);
  expect(requestedPages).toEqual([1, 2, 2, 3]);
  expect(pageBodies.every((body) => JSON.stringify(body) === JSON.stringify(countBody))).toBe(true);
  expect(maxActivePageRequests).toBe(1);

  totalPages = 0;
  await page.getByRole("button", { name: "Pull all matching issues" }).click();
  await expect(page.getByText("Queueing completed · 0 issues queued.")).toBeVisible();
  await expect(page.locator("#pull-filtered-state .filtered-pull-complete")).toBeVisible();
  expect(countRequests).toBe(2);
  expect(requestedPages).toEqual([1, 2, 2, 3]);
  await expect(page.getByRole("cell", { name: "BLG-11" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of ["Reset", "Pull all matching issues", "Find candidates"]) {
    const button = page.getByRole(name === "Reset" ? "link" : "button", { name });
    await expect(button).toBeVisible();
    expect(await button.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= window.innerWidth;
    })).toBe(true);
  }
});

test("Find candidates updates results without reloading the document", async ({ page }) => {
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: false }, sync_to_cis: { enabled: true }, sync_translate_jira: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [], assignees: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-42", summary: "Inline candidate", status: "Open" }], meta: { returned_count: 1, source_rows_scanned: 1, stop_reason: "source_exhausted" } } }) }));

  await enter(page, "/backlog-issues");
  const documentMarker = await page.evaluate(() => { document.documentElement.dataset.findCandidatesMarker = "same-document"; return document.documentElement.dataset.findCandidatesMarker; });
  await page.getByRole("button", { name: "Find candidates" }).click();
  await expect(page.getByRole("cell", { name: "BLG-42" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.findCandidatesMarker)).toBe(documentMarker);
  await expect(page).toHaveURL(/submitted=1/);
});

test("CIS Issue search updates the register in place and identifies its source system", async ({ page }) => {
  await page.route("**/api/v1/projects/1/issues**", (route) => {
    const params = new URL(route.request().url()).searchParams;
    const query = params.get("q");
    const currentPage = Number(params.get("page") || "1");
    const issue = query
      ? { id: "issue-jira", jira_issue_key: "ABC-12", current_summary: "Jira search result", sync_status: "ingested" }
      : currentPage === 2
        ? { id: "issue-backlog-2", backlog_issue_key: "MAP-95", current_summary: "Second page result", sync_status: "ingested" }
        : { id: "issue-backlog", backlog_issue_key: "MAP-94", jira_issue_key: "ABC-12", current_summary: "Backlog source result", sync_status: "ingested" };
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { items: [issue], pagination: { page: currentPage, page_size: 20, total: 21, total_pages: 2 } } }) });
  });

  await enter(page, "/cis-issues");
  const documentMarker = await page.evaluate(() => { document.documentElement.dataset.issueListMarker = "same-document"; return document.documentElement.dataset.issueListMarker; });
  await expect(page.locator(".issue-source").first()).toHaveText("Backlog (MAP-94)");
  await expect(page.locator(".issue-source").nth(1)).toHaveText("Jira (ABC-12)");
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.locator(".issue-source").first()).toHaveText("Backlog (MAP-95)");
  await expect(page).toHaveURL(/page=2/);
  const filters = page.locator(".cis-issue-filters");
  await filters.getByLabel("Summary").fill("jira");
  await filters.getByRole("button", { name: "Search issues" }).click();
  await expect(page.locator(".issue-source").first()).toHaveText("Jira (ABC-12)");
  expect(await page.evaluate(() => document.documentElement.dataset.issueListMarker)).toBe(documentMarker);
  await expect(page).toHaveURL(/q=jira/);
});

test("backlog: Sync + Translate + Jira queues the full workflow", async ({ page }) => {
  let requestBody;
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: false }, sync_to_cis: { enabled: true }, sync_translate_jira: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [], assignees: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-10", summary: "Deliver to Jira", status: "Open", active_job: null }], meta: { returned_count: 1, source_rows_scanned: 1, stop_reason: "source_exhausted" } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-10/sync-to-cis", (route) => {
    requestBody = route.request().postDataJSON();
    return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { outcome: "queued", job: { id: "job-10", status: "pending" } } }) });
  });
  await page.route("**/api/v1/projects/1/sync-jobs/job-10", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "job-10", status: "success" } }) }));

  await enter(page, "/backlog-issues?submitted=1&created_from=2026-07-01&created_to=2026-07-16&limit=20");
  await page.getByRole("button", { name: "Sync + Translate + Jira", exact: true }).click();
  await expect(page.getByText(/Job job-10: success.*Jira delivery complete/)).toBeVisible();
  expect(requestBody).toEqual({ with_translation: true, push_to_jira: true });
});

test("backlog restores active candidate jobs after reload", async ({ page }) => {
  let syncRequests = 0;
  let jobReads = 0;
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: false, disabled_reasons: ["PROJECT_PULL_DISABLED"] }, sync_to_cis: { enabled: true }, sync_translate_jira: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [], assignees: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-8", summary: "Queued before reload", status: "Open", assignee: null, created_at_source: "2026-07-16T00:00:00Z", active_job: { id: "job-8", status: "pending", with_translation: true, push_to_jira: true } }, { backlog_issue_key: "BLG-9", summary: "Independent candidate", status: "Open", assignee: null, created_at_source: "2026-07-16T00:00:00Z", active_job: null }], meta: { returned_count: 2, source_rows_scanned: 2, stop_reason: "source_exhausted" } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-8/sync-to-cis", (route) => {
    syncRequests += 1;
    return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: { code: "UNEXPECTED_POST", message: "Active rows must not enqueue again." } }) });
  });
  await page.route("**/api/v1/projects/1/sync-jobs/job-8", (route) => {
    jobReads += 1;
    const status = jobReads >= 2 ? "success" : "running";
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "job-8", status } }) });
  });

  const target = "/backlog-issues?submitted=1&created_from=2026-07-01&created_to=2026-07-16&limit=20";
  await enter(page, target);
  const activeRow = page.locator('tr[data-candidate="BLG-8"]');
  const independentRow = page.locator('tr[data-candidate="BLG-9"]');
  await expect(activeRow.getByRole("button", { name: "Sync to CIS" })).toBeDisabled();
  await expect(activeRow.getByRole("button", { name: "Sync + Translate", exact: true })).toBeDisabled();
  await expect(activeRow.getByRole("button", { name: "Sync + Translate + Jira", exact: true })).toBeDisabled();
  await expect(independentRow.getByRole("button", { name: "Sync to CIS" })).toBeEnabled();
  await expect(independentRow.getByRole("button", { name: "Sync + Translate", exact: true })).toBeEnabled();
  await expect(independentRow.getByRole("button", { name: "Sync + Translate + Jira", exact: true })).toBeEnabled();
  await expect(page.getByText(/Job job-8: success.*Jira delivery complete/)).toBeVisible();

  jobReads = 0;
  await page.reload();
  await expect(page.locator('tr[data-candidate="BLG-8"]').getByRole("button", { name: "Sync to CIS" })).toBeDisabled();
  await expect(page.locator('tr[data-candidate="BLG-9"]').getByRole("button", { name: "Sync to CIS" })).toBeEnabled();
  await expect(page.getByText(/Job job-8: success.*Jira delivery complete/)).toBeVisible();
  expect(syncRequests).toBe(0);
});

test("project and scheduled pull controls stay disabled", async ({ page }) => {
  await enter(page, "/projects?project_id=1");
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/project/1/dashboard");
  await expect(page.getByRole("checkbox", { name: /Scheduled pull/ })).toBeDisabled();
  await expect(page.getByText("Project pull and scheduled pull are disabled; use Pull one or candidate actions.")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("checkbox", { name: /Scheduled pull/ })).toBeVisible();
});

test("backlog explains empty candidate results and clears only optional filters", async ({ page }) => {
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: false, disabled_reasons: ["PROJECT_PULL_DISABLED"] }, sync_to_cis: { enabled: true }, sync_translate_jira: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [{ id: 2, name: "STG化OK" }], assignees: [{ id: 11, name: "D.M.Phuc" }] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [], meta: { returned_count: 0, source_rows_scanned: 0, excluded_existing_cis_count: 0, stop_reason: "source_exhausted" } } }) }));
  await enter(page, "/backlog-issues?submitted=1&created_from=2026-05-01&created_to=2026-07-15&limit=20&status_id=2&assignee_id=11&not_closed=true");
  await expect(page.getByRole("heading", { name: "No source issues match these filters" })).toBeVisible();
  await expect(page.getByLabel("Active optional filters")).toContainText("Status: STG化OK");
  await expect(page.getByLabel("Active optional filters")).toContainText("Assignee: D.M.Phuc");
  const clear = page.getByRole("link", { name: "Clear optional filters and search" });
  await expect(clear).toHaveAttribute("href", /created_from=2026-05-01.*created_to=2026-07-15.*limit=20/);
  await expect(clear).not.toHaveAttribute("href", /status_id|assignee_id|not_closed/);
});

test("mappings group values by field inside one compact flow table", async ({ page }) => {
  let settingsRequests = 0;
  let savedMapping;
  let finishSave;
  let finishBacklogPull;
  let featureSaveAttempts = 0;
  await page.route("**/api/v1/projects/1/mapping-settings**", (route) => {
    settingsRequests += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { flows: { systems_to_cis: [
    { project_id: 1, mapping_type: "issue_type", mapping_label: "Issue type", direction_from: "backlog", direction_to: "cis", from_value: "bug", from_label: "Bug", to_value: "task", required_for_jira: true, issue_count: 3, cis_values: [{ value: "task", label: "Task" }, { value: "bug", label: "Bug" }], existing_rule: { id: 41, to_value: "task", approval_status: "approved" } },
    { project_id: 1, mapping_type: "issue_type", mapping_label: "Issue type", from_value: "feature", from_label: "Feature", to_value: "task", required_for_jira: true, issue_count: 2, cis_values: [{ value: "task", label: "Task" }, { value: "bug", label: "Bug" }], existing_rule: { id: 43, to_value: "task", approval_status: "approved" } },
    { project_id: 1, mapping_type: "priority", mapping_label: "Priority", from_value: "high", from_label: "High", to_value: "high", required_for_jira: true, issue_count: 1, cis_values: [{ value: "high", label: "High" }] },
    ], cis_to_system: [] } } }) });
  });
  await page.route("**/api/v1/projects/1/mapping-rules/41", async (route) => {
    savedMapping = route.request().postDataJSON();
    await new Promise((resolve) => { finishSave = resolve; });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: 41, ...savedMapping, approval_status: "approved" } }) });
  });
  await page.route("**/api/v1/projects/1/mapping-rules/43", async (route) => {
    featureSaveAttempts += 1;
    if (featureSaveAttempts === 1) return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: { code: "VERIFY_FAILURE", message: "Temporary mapping failure" } }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: 43, to_value: route.request().postDataJSON().to_value, approval_status: "approved" } }) });
  });
  await page.route("**/api/v1/projects/1/backlog/mapping-values/pull", async (route) => {
    await new Promise((resolve) => { finishBacklogPull = resolve; });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { warnings: [] } }) });
  });
  for (const path of ["jira/mapping-values/pull", "cis/mapping-values/sync"]) {
    await page.route(`**/api/v1/projects/1/${path}`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { warnings: [] } }) }));
  }
  await enter(page, "/mappings");
  await page.locator(".page-heading").evaluate((element) => { element.dataset.stable = "true"; });
  const sourceFlow = page.locator('[data-mapping-flow="source"]');
  await expect(sourceFlow.locator("table")).toHaveCount(1);
  await expect(sourceFlow.locator("[data-mapping-group]")).toHaveCount(2);
  const issueTypeGroup = sourceFlow.locator('[data-mapping-group="source:issue_type"]');
  await expect(issueTypeGroup.getByRole("button", { name: /Issue type.*2 values.*5 issues/ })).toBeVisible();
  await issueTypeGroup.getByRole("button", { name: /Issue type/ }).click();
  await expect(issueTypeGroup.locator("[data-mapping]:visible")).toHaveCount(0);
  await issueTypeGroup.getByRole("button", { name: /Issue type/ }).click();
  await expect(issueTypeGroup.locator("[data-mapping]:visible")).toHaveCount(2);
  const bug = page.locator('[data-mapping="source:issue_type:bug"]');
  const feature = page.locator('[data-mapping="source:issue_type:feature"]');
  await expect(bug.getByRole("button", { name: "Save" })).toBeDisabled();
  await bug.getByRole("combobox").selectOption("bug");
  await feature.getByRole("combobox").selectOption("bug");
  await expect(bug.getByRole("button", { name: "Save" })).toBeEnabled();
  await bug.getByRole("button", { name: "Save" }).click();
  await expect(bug).toHaveAttribute("aria-busy", "true");
  await expect(bug.getByRole("button", { name: "Saving…" })).toBeDisabled();
  await expect(feature.getByRole("combobox")).toHaveValue("bug");
  await expect(feature.locator("[data-status]")).toContainText("Unsaved");
  await expect(feature.getByRole("button", { name: "Save" })).toBeEnabled();
  await expect.poll(() => typeof finishSave).toBe("function");
  finishSave();
  await expect(bug.locator("[data-status]")).toContainText("approved");
  await expect(bug.getByRole("button", { name: "Save" })).toBeDisabled();
  expect(savedMapping).toEqual({ to_value: "bug" });
  expect(settingsRequests).toBe(1);
  await expect(page.locator(".page-heading")).toHaveAttribute("data-stable", "true");

  await feature.getByRole("button", { name: "Save" }).click();
  await expect(feature.locator(".job-evidence")).toContainText("Temporary mapping failure");
  await expect(feature.getByRole("combobox")).toHaveValue("bug");
  await expect(feature.locator("[data-status]")).toContainText("Unsaved");
  await expect(feature.getByRole("button", { name: "Save" })).toBeEnabled();

  const pullBacklog = page.locator("#pull-backlog");
  await pullBacklog.click();
  await expect(pullBacklog).toHaveText(/Refreshing/);
  await expect(pullBacklog).toBeDisabled();
  await expect(page.locator("#pull-jira")).toBeEnabled();
  await expect(page.locator("#sync-cis")).toBeEnabled();
  await expect(feature.getByRole("combobox")).toHaveValue("bug");
  await expect.poll(() => typeof finishBacklogPull).toBe("function");
  finishBacklogPull();
  await expect(page.locator("#mapping-notice")).toContainText("Backlog catalog refreshed.");

  for (const [name, notice] of [["Pull Jira fields", "Jira catalog refreshed."], ["Sync CIS catalog from Jira", "CIS catalog synchronized."]]) {
    await page.getByRole("button", { name }).click();
    await expect(page.locator("#mapping-notice")).toContainText(notice);
    await expect(page.locator(".page-heading")).toHaveAttribute("data-stable", "true");
    await expect(feature.getByRole("combobox")).toHaveValue("bug");
    await expect(feature.locator("[data-status]")).toContainText("Unsaved");
  }
  await feature.getByRole("button", { name: "Save" }).click();
  await expect(feature.locator("[data-status]")).toContainText("approved");
  expect(featureSaveAttempts).toBe(2);
  expect(settingsRequests).toBe(1);
  await expect(page).toHaveURL(/\/project\/1\/mappings$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(issueTypeGroup.getByRole("button", { name: /Issue type/ })).toBeVisible();
  await expect(bug.getByRole("combobox")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("CIS to Jira fills and saves only unmapped equal targets", async ({ page }) => {
  const created = [];
  const approved = [];
  await page.route("**/api/v1/projects/1/mapping-settings**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { flows: { systems_to_cis: [], cis_to_system: [
    { mapping_type: "issue_type", mapping_label: "Issue type", direction_from: "cis", direction_to: "jira", from_value: "Bug", from_label: "Bug", system_values: [{ value: "10001", label: "Bug" }] },
    { mapping_type: "issue_type", mapping_label: "Issue type", direction_from: "cis", direction_to: "jira", from_value: "Task", from_label: "Task", to_value: "10003", system_values: [{ value: "10003", label: "Task" }], existing_rule: { id: 4, to_value: "10003", approval_status: "approved" } },
  ] } } }) }));
  await page.route("**/api/v1/projects/1/mapping-rules", (route) => {
    const body = route.request().postDataJSON();
    created.push(body);
    return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ data: { id: 9, ...body, approval_status: "pending" } }) });
  });
  await page.route("**/api/v1/projects/1/mapping-rules/9/approve", (route) => {
    approved.push(route.request().method());
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: 9, approval_status: "approved", to_value: "10001" } }) });
  });

  await enter(page, "/mappings");
  const targetFlow = page.locator('[data-mapping-flow="target"]');
  await targetFlow.getByRole("button", { name: "Fill equal target" }).click();
  await expect(targetFlow.locator('[data-mapping="target:issue_type:Bug"] [data-status]')).toContainText("approved");
  await expect(targetFlow.locator('[data-mapping="target:issue_type:Task"] select')).toHaveValue("10003");
  expect(created).toEqual([{ to_value: "10001", mapping_type: "issue_type", direction_from: "cis", direction_to: "jira", from_value: "Bug" }]);
  expect(approved).toEqual(["POST"]);
});

test("Save all persists changed mappings within one field band in both flows", async ({ page }) => {
  const updates = [];
  const approvals = [];
  await page.route("**/api/v1/projects/1/mapping-settings**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { flows: {
    systems_to_cis: [{ mapping_type: "user", mapping_label: "Project user", direction_from: "backlog", direction_to: "cis", from_value: "Mai", to_value: "mai", cis_values: ["mai", "linh"], existing_rule: { id: 31, to_value: "mai", approval_status: "approved" } }],
    cis_to_system: [{ mapping_type: "user", mapping_label: "Project user", direction_from: "cis", direction_to: "jira", from_value: "Mai", to_value: "100", system_values: [{ value: "100", label: "Mai" }, { value: "101", label: "Linh" }], existing_rule: { id: 32, to_value: "100", approval_status: "approved" } }],
  } } }) }));
  await page.route("**/api/v1/projects/1/mapping-rules/*", (route) => {
    const path = new URL(route.request().url()).pathname;
    updates.push({ path, body: route.request().postDataJSON() });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: path.endsWith("31") ? 31 : 32, to_value: route.request().postDataJSON().to_value, approval_status: "pending" } }) });
  });
  await page.route("**/api/v1/projects/1/mapping-rules/*/approve", (route) => {
    const path = new URL(route.request().url()).pathname;
    approvals.push(path);
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: path.includes("31") ? 31 : 32, to_value: path.includes("31") ? "linh" : "101", approval_status: "approved" } }) });
  });

  await enter(page, "/mappings");
  const sourceGroup = page.locator('[data-mapping-group="source:user"]');
  const targetGroup = page.locator('[data-mapping-group="target:user"]');
  await expect(sourceGroup.getByRole("button", { name: "Save all" })).toBeDisabled();
  await sourceGroup.getByRole("combobox").selectOption("linh");
  await targetGroup.getByRole("combobox").selectOption("101");
  await expect(sourceGroup.getByRole("button", { name: "Save all" })).toBeEnabled();
  await expect(targetGroup.getByRole("button", { name: "Save all" })).toBeEnabled();
  await sourceGroup.getByRole("button", { name: "Save all" }).click();
  await targetGroup.getByRole("button", { name: "Save all" }).click();
  await expect(sourceGroup.locator("[data-status]")).toContainText("approved");
  await expect(targetGroup.locator("[data-status]")).toContainText("approved");
  expect(updates).toEqual([
    { path: "/api/v1/projects/1/mapping-rules/31", body: { to_value: "linh" } },
    { path: "/api/v1/projects/1/mapping-rules/32", body: { to_value: "101" } },
  ]);
  expect(approvals).toEqual(["/api/v1/projects/1/mapping-rules/31/approve", "/api/v1/projects/1/mapping-rules/32/approve"]);
});

test("issue-editor: canonical surface and blocked Jira dry-run", async ({ page }) => {
  const longSource = `## Source detail\n\n${Array.from({ length: 14 }, (_, index) => `Source paragraph ${index + 1}: evidence remains available when the panel expands.`).join("\n\n")}`;
  const editor = { issue: { id: "issue-1", project_id: 1, sync_status: "pending_mapping", current_revision: 2 }, canonical: { summary: { value: "Canonical", source: "manual" }, description: { value: "## Details\n\nBody\n\n<script>alert('x')</script>", source: "manual" }, story_point: { value: 1, source: "default" } }, sources: { summary: { cis: "Canonical", backlog: "Source summary", jira: "Target summary" }, description: { cis: "## CIS detail\n\nCanonical evidence", backlog: longSource, jira: "## Jira detail\n\nTarget evidence" }, priority: { cis: "Medium", backlog: "Normal", jira: "Medium" }, status: { cis: "In Review", backlog: "Resolved", jira: "In Review" }, story_point: {} }, field_meta: { catalogs: {} }, translations: [{ id: null, target_field: "summary", source_text: "Source summary", ai_draft: null, review_status: "pending", is_placeholder: true }, { id: 7, target_field: "description", source_text: "## Source\n\n**Original**", ai_draft: "## Draft\n\n**Translated**", review_status: "ai_draft" }], translation: { total: 2 }, sync: { canonical_hash: "1234567890abcdef" } };
  let editorRequests = 0;
  let savedCanonical;
  let finishRetranslate;
  await page.route("**/api/v1/projects/1/issues/issue-1/editor", (route) => { editorRequests += 1; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: editor }) }); });
  await page.route("**/api/v1/projects/1/issues/issue-1/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.route("**/api/v1/projects/1/issues/issue-1/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  await page.route("**/api/v1/projects/1/issues/issue-1/dry-run/jira", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { can_sync: false, payload: { fields: { summary: "Canonical" } }, validation: { errors: [{ code: "MAPPING_REQUIRED", message: "Required mapping is missing." }] }, warnings: [] } }) }));
  await page.route("**/api/v1/projects/1/issues/issue-1", async (route) => {
    savedCanonical = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { issue: editor.issue, canonical: editor.canonical, changed_fields: ["description"] } }) });
  });
  await page.route("**/api/v1/projects/1/issues/issue-1/translations/7/translate", async (route) => {
    await new Promise((resolve) => { finishRetranslate = resolve; });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { item: { ...editor.translations[0], ai_draft: "## Fresh AI draft\n\nAwaiting approval", review_status: "ai_draft" }, execution_status: "completed", queued_job_ids: [], job: null } }) });
  });
  await page.route("**/api/v1/projects/1/issues/issue-1/translations/translate", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ target_field: "summary" });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { translations: [{ id: 8, target_field: "summary", source_text: "Source summary", ai_draft: "Fresh summary draft", review_status: "ai_draft" }], execution_status: "completed", queued_job_ids: [] } }) });
  });
  await enter(page, "/cis-issues/issue-1");
  await expect(page.getByRole("heading", { name: "Issue Editor" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Translate issue" })).toHaveCount(0);
  const summaryTranslation = page.locator('[data-translation="field-summary"]');
  await expect(summaryTranslation.getByRole("textbox", { name: "AI draft" })).toHaveValue("");
  await expect(summaryTranslation.locator("[data-translation-status]")).toContainText("pending");
  await summaryTranslation.getByRole("button", { name: "Retranslate" }).click();
  await expect(summaryTranslation.getByRole("textbox", { name: "AI draft" })).toHaveValue("Fresh summary draft");
  await expect(page.locator("#canonical-summary")).toHaveValue("Canonical");
  await expect(summaryTranslation.getByRole("button", { name: "Approve", exact: true })).toBeEnabled();
  await expect(page.locator("#canonical-summary").locator("..")).toHaveClass(/col-12/);
  await expect(page.getByLabel("Story Point · default")).toHaveValue("1");
  const description = page.locator("#canonical-description");
  const canonicalEditor = page.locator("[data-markdown-editor]").filter({ has: description });
  await description.evaluate((element) => {
    const start = element.value.indexOf("Body");
    element.setSelectionRange(start, start + "Body\n\n".length);
  });
  await canonicalEditor.getByRole("button", { name: "Bold" }).click();
  await expect(description).toHaveValue("## Details\n\n**Body**\n\n<script>alert('x')</script>");
  await canonicalEditor.getByRole("tab", { name: "Preview" }).click();
  const preview = canonicalEditor.locator('[data-md-panel="preview"]');
  await expect(preview.getByRole("heading", { name: "Details" })).toBeVisible();
  await expect(preview.getByText("Body", { exact: true })).toBeVisible();
  await expect(preview.locator("script")).toHaveCount(0);
  await page.getByRole("button", { name: "Save canonical revision" }).click();
  await expect.poll(() => savedCanonical?.reason).toBe("");
  expect(editorRequests).toBe(1);
  await expect(description).toHaveValue("## Details\n\n**Body**\n\n<script>alert('x')</script>");
  await expect(page.getByRole("button", { name: "Save canonical revision" })).toBeEnabled();
  const snapshots = page.locator("[data-source-snapshots]");
  await expect(snapshots).toHaveCount(1);
  expect(await snapshots.evaluate((element) => element.parentElement.lastElementChild === element)).toBe(true);
  const [mainBox, railBox] = await Promise.all([page.locator(".issue-editor-main").boundingBox(), page.locator(".issue-editor-rail").boundingBox()]);
  expect(railBox.x).toBeGreaterThan(mainBox.x + mainBox.width);
  await expect(snapshots.locator('[data-snapshot-field="description"]')).toHaveClass(/snapshot-field--wide/);
  await expect(snapshots.locator('[data-snapshot-field="priority"]')).toBeVisible();
  const sourceDetail = snapshots.locator('[data-snapshot-field="description"]');
  await expect(sourceDetail.getByRole("heading", { name: "Source detail" })).toBeVisible();
  const showMore = sourceDetail.locator(".snapshot-system").filter({ hasText: "BACKLOG" }).locator("[data-snapshot-toggle]");
  await expect(showMore).toBeVisible();
  await showMore.click();
  await expect(showMore).toHaveAttribute("aria-expanded", "true");
  await expect(showMore).toHaveText("Show less");
  const translation = page.locator('[data-translation="7"]');
  const sourcePreview = translation.locator("[data-md-readonly]");
  await expect(sourcePreview.getByRole("heading", { name: "Source" })).toBeVisible();
  await expect(sourcePreview.getByText("Original", { exact: true })).toBeVisible();
  await expect(sourcePreview).not.toContainText("## Source");
  const reviewed = translation.locator(".translation-workbench");
  await expect(reviewed.getByRole("textbox", { name: "AI draft" })).toHaveValue("## Draft\n\n**Translated**");
  await expect(translation.getByRole("button", { name: "Save draft" })).toBeVisible();
  await expect(translation.getByRole("button", { name: "Approve", exact: true })).toBeVisible();
  const retranslate = translation.locator('[data-translation-action="retranslate"]');
  await expect(retranslate).toHaveAccessibleName("Retranslate");
  await retranslate.click();
  await expect(retranslate).toContainText("Retranslating…");
  await expect.poll(() => typeof finishRetranslate).toBe("function");
  finishRetranslate();
  await expect(translation.locator(".job-evidence")).toContainText("Draft retranslated. Review and approve to update canonical.");
  await expect(reviewed.getByRole("textbox", { name: "AI draft" })).toHaveValue("## Fresh AI draft\n\nAwaiting approval");
  await expect(description).toHaveValue("## Details\n\n**Body**\n\n<script>alert('x')</script>");
  await expect(translation.locator("[data-translation-status]")).toContainText("ai_draft");
  await expect(translation.getByRole("button", { name: "Approve", exact: true })).toBeEnabled();
  await expect(retranslate).toBeEnabled();
  await reviewed.getByRole("tab", { name: "Preview" }).click();
  await expect(reviewed.getByRole("heading", { name: "Fresh AI draft" })).toBeVisible();
  const heights = await Promise.all([translation.locator(".translation-source").evaluate((element) => element.getBoundingClientRect().height), reviewed.evaluate((element) => element.getBoundingClientRect().height)]);
  expect(Math.abs(heights[0] - heights[1])).toBeLessThan(2);
  await page.getByRole("button", { name: "Prepare Jira sync" }).click();
  const dialog = page.getByRole("dialog", { name: "Jira sync preparation" });
  await expect(dialog).toContainText("Required mapping is missing.");
  await expect(dialog.getByLabel("Story Point")).toBeVisible();
  await expect(dialog.getByLabel("Story Point")).toBeDisabled();
  await expect(dialog).toContainText("Not available for this issue type in Jira");
  await expect(dialog.getByRole("button", { name: "Sync Jira" })).toBeDisabled();
  await dialog.locator("[data-dialog-close]").last().click();
  await page.setViewportSize({ width: 500, height: 900 });
  const [mobileMain, mobileRail] = await Promise.all([page.locator(".issue-editor-main").boundingBox(), page.locator(".issue-editor-rail").boundingBox()]);
  expect(mobileMain.y).toBeGreaterThan(mobileRail.y + mobileRail.height);
});

test("issue-editor: Backlog resync refreshes mapped CIS fields without reloading drafts", async ({ page }) => {
  const base = {
    issue: { id: "issue-resync", project_id: 1, backlog_issue_key: "WEC-1", sync_status: "ingested", current_revision: 1 },
    canonical: {
      summary: { value: "Unsaved-safe summary", source: "cis" },
      description: { value: "Original description", source: "cis" },
      issue_type: { value: "Sub-task", source: "cis" },
      priority: { value: "Medium", source: "cis" },
      status: { value: "To Do", source: "cis" },
      assignee: { value: "old-user", source: "cis" },
      story_point: { value: 1, source: "default" },
    },
    sources: {},
    field_meta: { catalogs: { issue_type: ["Sub-task", "Task"], priority: ["Medium", "High"], status: ["To Do", "Done"], assignee: ["old-user", "new-user"] } },
    translations: [], translation: { total: 0 }, sync: { canonical_hash: "resync-hash" },
  };
  const remapped = { ...base, canonical: { ...base.canonical, issue_type: { value: "Task", source: "cis" }, priority: { value: "High", source: "cis" }, status: { value: "Done", source: "cis" }, assignee: { value: "new-user", source: "cis" } } };
  let editorRequests = 0;
  await page.route("**/api/v1/projects/1/issues/issue-resync/editor", (route) => {
    editorRequests += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: editorRequests > 1 ? remapped : base }) });
  });
  await page.route("**/api/v1/projects/1/issues/issue-resync/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.route("**/api/v1/projects/1/issues/issue-resync/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/WEC-1/pull", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: "resync-job", status: "success" } }) }));
  await page.route("**/api/v1/projects/1/sync-jobs/resync-job", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "resync-job", status: "success" } }) }));

  await enter(page, "/cis-issues/issue-resync");
  await page.locator("#canonical-summary").fill("Local unsaved summary");
  await page.getByRole("button", { name: "Resync Backlog" }).click();
  await expect(page.locator("#resync-state")).toContainText("CIS mappings refreshed");
  await expect(page.locator("#canonical-issue_type")).toHaveValue("Task");
  await expect(page.locator("#canonical-priority")).toHaveValue("High");
  await expect(page.locator("#canonical-status")).toHaveValue("Done");
  await expect(page.locator("#canonical-assignee")).toHaveValue("new-user");
  await expect(page.locator("#canonical-summary")).toHaveValue("Local unsaved summary");
  expect(editorRequests).toBe(2);
  await expect(page).toHaveURL(/\/project\/1\/cis-issues\/issue-resync$/);
});

test("Jira gate publishes operator-reviewed fields after a successful dry-run", async ({ page }) => {
  const editor = { issue: { id: "issue-2", project_id: 1, sync_status: "ready", current_revision: 1 }, canonical: { summary: { value: "Canonical", source: "manual" }, story_point: { value: 1, source: "default" } }, sources: {}, field_meta: { catalogs: {}, catalogs_by_system: { jira: { issue_type: ["Task", "Bug"], priority: ["High", "Medium"], status: ["To Do", "Done"], assignee: [{ value: "account-123", label: "Tuan Anh" }, { value: "account-456", label: "Mai Hoang" }] } } }, translations: [], translation: { total: 0 }, sync: { canonical_hash: "abcdef1234567890" } };
  await page.route("**/api/v1/projects/1/issues/issue-2/editor", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: editor }) }));
  await page.route("**/api/v1/projects/1/issues/issue-2/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.route("**/api/v1/projects/1/issues/issue-2/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  await page.route("**/api/v1/projects/1/issues/issue-2/dry-run/jira", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { can_sync: true, target_fields: { story_point: "customfield_10038" }, payload: { fields: { summary: "Canonical", description: "Prepared", issuetype: { name: "Task" }, priority: { name: "High" }, assignee: { accountId: "account-123" }, duedate: "2026-07-31", customfield_10038: 1 }, transition_preview: { status: "To Do" } }, validation: { errors: [] }, warnings: [] } }) }));
  let published;
  await page.route("**/api/v1/projects/1/issues/issue-2/sync/jira", async (route) => {
    published = route.request().postDataJSON();
    await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: "jira-job-2", status: "pending" } }) });
  });
  await page.route("**/api/v1/projects/1/sync-jobs/jira-job-2", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "jira-job-2", status: "success" } }) }));
  await enter(page, "/cis-issues/issue-2");
  await page.getByRole("button", { name: "Prepare Jira sync" }).click();
  const dialog = page.getByRole("dialog", { name: "Jira sync preparation" });
  await expect(dialog.getByLabel("Issue type")).toHaveJSProperty("tagName", "SELECT");
  await expect(dialog.getByLabel("Priority")).toHaveJSProperty("tagName", "SELECT");
  await expect(dialog.getByLabel("Target status")).toHaveJSProperty("tagName", "SELECT");
  await expect(dialog.getByLabel("Assignee")).toHaveJSProperty("tagName", "SELECT");
  await expect(dialog.getByLabel("Assignee")).toHaveValue("account-123");
  await expect(dialog.getByLabel("Assignee").locator("option:checked")).toHaveText("Tuan Anh");
  await dialog.getByLabel("Summary").fill("Operator-approved summary");
  await dialog.getByLabel("Story Point").fill("5");
  await dialog.getByRole("button", { name: "Sync Jira" }).click();
  await expect.poll(() => published).toEqual({ jira_fields: { summary: "Operator-approved summary", description: "Prepared", issue_type: "Task", priority: "High", status: "To Do", assignee: "account-123", due_date: "2026-07-31", story_point: "5" } });
  await expect(dialog.getByText("Job jira-job-2: success")).toBeVisible();
});

test("operations keep retry and anomaly decisions local to the active row", async ({ page }) => {
  const jobs = [
    { id: "job-failed", project_id: 1, job_type: "manual_pull", direction_from: "backlog", direction_to: "cis", source_issue_key: "MAP-89", target_issue_key: "MAP-89", status: "failed", created_at: "2026-07-16T00:00:00Z", last_error: "Provider timeout" },
    { id: "job-pending", project_id: 1, job_type: "translate", direction_from: "cis", direction_to: "cis", status: "pending", created_at: "2026-07-16T00:01:00Z" },
  ];
  let finishRetry;
  await page.route("**/api/v1/projects/1/sync-jobs", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: jobs }) }));
  await page.route("**/api/v1/projects/1/sync-jobs/job-failed/retry", async (route) => {
    await new Promise((resolve) => { finishRetry = resolve; });
    jobs[0].status = "pending";
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: jobs[0] }) });
  });
  await enter(page, "/sync-jobs");
  const failedRow = page.locator('[data-job="job-failed"]');
  const pendingRow = page.locator('[data-job="job-pending"]');
  await pendingRow.evaluate((element) => { element.dataset.stable = "true"; });
  await expect(failedRow.locator('[data-label="Source issue"]')).toHaveText("MAP-89");
  await expect(failedRow.locator('[data-label="Target issue"]')).toHaveText("—");
  await failedRow.getByRole("button", { name: "Retry" }).click();
  await expect(failedRow.getByRole("button", { name: "Working…" })).toBeDisabled();
  await expect(pendingRow.getByRole("button", { name: "Cancel" })).toBeEnabled();
  await expect(pendingRow).toHaveAttribute("data-stable", "true");
  await expect.poll(() => typeof finishRetry).toBe("function");
  finishRetry();
  await expect(failedRow.locator("[data-job-status]")).toContainText("pending");
  await expect(pendingRow).toHaveAttribute("data-stable", "true");

  const anomalies = [
    { id: 1, project_id: 1, anomaly_type: "mapping_gap", severity: "critical", status: "open", details_json: { field: "status" } },
    { id: 2, project_id: 1, anomaly_type: "routing_mismatch", severity: "warning", status: "open", details_json: { route: "backlog" } },
  ];
  await page.route("**/api/v1/projects/1/anomalies", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: anomalies }) }));
  await page.route("**/api/v1/projects/1/anomalies/1", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: anomalies[0] }) }));
  await page.route("**/api/v1/projects/1/anomalies/1/resolve", (route) => {
    anomalies[0].status = "resolved";
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: anomalies[0] }) });
  });
  await page.goto(workspace("/anomalies"));
  const firstAnomaly = page.locator('[data-anomaly="1"]');
  const secondAnomaly = page.locator('[data-anomaly="2"]');
  await secondAnomaly.evaluate((element) => { element.dataset.stable = "true"; });
  await firstAnomaly.getByRole("button", { name: "Inspect" }).click();
  await page.getByRole("dialog", { name: "Anomaly 1 details" }).getByRole("button", { name: "Resolve" }).click();
  await expect(firstAnomaly.locator("[data-anomaly-status]")).toContainText("resolved");
  await expect(secondAnomaly).toHaveAttribute("data-stable", "true");
});

test("translation queue and glossary expose human review controls", async ({ page }) => {
  const queueItem = { id: 7, issue_id: "issue-1", source_system: "backlog", system_issue_key: "ONE_KYORITSU-2292", target_field: "summary", source_text: "## Source heading\nOriginal text", ai_draft: "**Draft translation**", review_status: "ai_draft", provider: "deepseek", model_or_command: "deepseek-v4-flash" };
  let savedDraft;
  await page.route("**/api/v1/projects/1/translation-queue**", async (route) => {
    if (route.request().method() === "POST" && route.request().url().endsWith("/approve")) {
      queueItem.review_status = "approved";
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: queueItem }) });
    }
    if (route.request().method() === "PUT") {
      savedDraft = route.request().postDataJSON();
      queueItem.ai_draft = savedDraft.draft_text;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: queueItem }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [queueItem] }) });
  });
  await enter(page, "/translation-queue");
  await page.locator("[data-queue='7']").evaluate((element) => { element.dataset.stable = "true"; });
  await expect(page.getByRole("heading", { name: "Translation Queue" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Source", exact: true })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Draft", exact: true })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Reviewed", exact: true })).toHaveCount(0);
  await expect(page.getByText("[BACKLOG]", { exact: true })).toBeVisible();
  await expect(page.getByText("ONE_KYORITSU-2292", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  const reviewDialog = page.getByRole("dialog", { name: "Edit translation draft" });
  await expect(reviewDialog.getByRole("heading", { name: "Source", exact: true })).toBeVisible();
  await expect(reviewDialog.getByRole("heading", { name: "Source heading" })).toBeVisible();
  const draftEditor = reviewDialog.getByRole("textbox", { name: "AI draft" });
  await expect(draftEditor).toHaveValue("**Draft translation**");
  await draftEditor.fill("**Operator draft**");
  await reviewDialog.getByRole("button", { name: "Save draft" }).click();
  await expect.poll(() => savedDraft).toEqual({ draft_text: "**Operator draft**", review_notes: "translation-queue" });
  await expect(page.locator("[data-queue='7']")).toHaveAttribute("data-stable", "true");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.locator("[data-queue='7'] [data-queue-status]")).toContainText("approved");
  await expect(page.locator("[data-queue='7']")).toHaveAttribute("data-stable", "true");
  await page.route("**/api/v1/projects/1/translation-glossary", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { concepts: [{ id: 1, group_key: "default", concept_key: "staging", note: "Environment", terms: [{ language_code: "ja", term: "ステージング", is_canonical: true }, { language_code: "vi", term: "STG", is_canonical: true }] }] } }) }));
  await page.getByRole("link", { name: "Translation Glossary" }).click();
  await expect(page).toHaveURL(/\/project\/1\/translation-glossary$/);
  await expect(page.getByRole("button", { name: "Add concept" })).toBeVisible();
  await expect(page.getByText("ステージング ★")).toBeVisible();
});
