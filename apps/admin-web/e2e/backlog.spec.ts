import { expect, Page, test } from "@playwright/test";

const email = "admin-ui@example.test";
const password = "verify-password";

async function mockAuth(page: Page) {
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { admin: { id: 1, email } } }) }));
  await page.route("**/api/v1/auth/login", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    if (body.password !== password) return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "backlog-token", admin: { id: 1, email } } }) });
  });
}

test("backlog browse loads saved filters and only searches after Find issues", async ({ page }) => {
  await mockAuth(page);
  let candidateCalls = 0;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 1, name: "Demo", backlog_project_key: "BLG" }] }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true, execution_mode: "read_only", disabled_reasons: [] } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, statuses: [{ id: 1, name: "Open" }, { id: 2, name: "Closed" }], assignees: [{ id: 10, name: "Tanaka" }, { id: 11, name: "Suzuki" }] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", async (route) => {
    candidateCalls += 1;
    const url = new URL(route.request().url());
    expect(url.searchParams.getAll("status_id")).toEqual(["1"]);
    expect(url.searchParams.getAll("assignee_id")).toEqual(["10"]);
    expect(url.searchParams.get("not_closed")).toBe("true");
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: {
      candidates: [{ backlog_issue_key: "BLG-1", summary: "Login screen fails", status: "Open", assignee: { id: 10, name: "Tanaka" }, created_at_source: "2026-07-15T01:00:00Z", updated_at_source: "2026-07-15T02:00:00Z" }],
      filters: { created_from: "2026-07-15", created_to: "2026-07-15", limit: 20, status_ids: [1], assignee_ids: [10], not_closed: true },
      meta: { requested_limit: 20, returned_count: 1, source_rows_scanned: 4, excluded_existing_cis_count: 3, pages_scanned: 1, source_exhausted: true, scan_limit_reached: false, deadline_reached: false, stop_reason: "source_exhausted", provider_error_code: null },
    } }) });
  });

  await page.goto("/login?next=%2Fbacklog-issues%3Fproject_id%3D1");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("link", { name: "Choose or create Project" }).click(); await page.getByRole("button", { name: "Open workspace" }).first().click();
  await expect(page).toHaveURL(/\/backlog-issues\?project_id=1$/);
  await expect(page.getByRole("heading", { name: "Backlog Issues", exact: true })).toBeVisible();
  await expect(page.getByText("Browse ready")).toBeVisible();
  await expect(page.getByText("No search submitted")).toBeVisible();
  expect(candidateCalls).toBe(0);

  await page.getByRole("checkbox", { name: "Status: Open" }).check();
  await page.getByRole("checkbox", { name: "Assignee: Tanaka" }).check();
  await page.getByText("Not closed").click();
  await page.getByRole("button", { name: "Find issues" }).click();
  await expect(page).toHaveURL(/project_id=1.*created_from=.*created_to=.*limit=20.*not_closed=true.*status_id=1.*assignee_id=10/);
  await expect(page.getByRole("cell", { name: "BLG-1" })).toBeVisible();
  await expect(page.getByText("Issues not in CIS")).toBeVisible();
  await expect(page.getByText("Next phase", { exact: true })).toBeVisible();
  expect(candidateCalls).toBe(1);

  await page.getByRole("checkbox", { name: "Status: Open" }).uncheck();
  await page.getByRole("checkbox", { name: "Status: Closed" }).check();
  await expect(page.getByText("No search submitted")).toBeVisible();
  expect(candidateCalls).toBe(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/backlog-issues\?project_id=1$/);
  await expect(page.getByText("No search submitted")).toBeVisible();
  expect(candidateCalls).toBe(1);
  await page.goForward();
  await expect(page).toHaveURL(/project_id=1.*created_from=/);
  await expect(page.getByText("No search submitted")).toBeVisible();
  expect(candidateCalls).toBe(1);
});

test("backlog filter errors lead to mappings without pulling automatically", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 1, name: "Demo" }] }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true, execution_mode: "read_only", disabled_reasons: [] } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: { code: "BACKLOG_CONFIG_INCOMPLETE", message: "Saved Backlog fields are unavailable." } }) }));
  await page.goto("/login?next=%2Fbacklog-issues%3Fproject_id%3D1");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("link", { name: "Choose or create Project" }).click(); await page.getByRole("button", { name: "Open workspace" }).first().click();
  await expect(page.getByText("Status and Assignee filters are unavailable: Saved Backlog fields are unavailable.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Mappings to pull Backlog fields" })).toHaveAttribute("href", "/mappings?project_id=1");
  await expect(page.getByRole("button", { name: "Find issues" })).toBeEnabled();
});

test("empty optional filters are omitted and empty candidates are explicit", async ({ page }) => {
  await mockAuth(page);
  let candidateCalls = 0;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 1, name: "Demo" }] }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true, disabled_reasons: [] } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, statuses: [{ id: 1, name: "Open" }], assignees: [{ id: 10, name: "Tanaka" }] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", async (route) => {
    candidateCalls += 1;
    const url = new URL(route.request().url());
    expect(url.searchParams.getAll("status_id")).toEqual([]);
    expect(url.searchParams.getAll("assignee_id")).toEqual([]);
    expect(url.searchParams.has("not_closed")).toBe(false);
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [], filters: { created_from: "2026-07-15", created_to: "2026-07-15", limit: 20, status_ids: [], assignee_ids: [], not_closed: false }, meta: { requested_limit: 20, returned_count: 0, source_rows_scanned: 0, excluded_existing_cis_count: 0, pages_scanned: 0, source_exhausted: true, scan_limit_reached: false, deadline_reached: false, stop_reason: "source_exhausted", provider_error_code: null } } }) });
  });
  await page.goto("/login?next=%2Fbacklog-issues%3Fproject_id%3D1");
  await page.getByLabel("Email").fill(email); await page.getByLabel("Password").fill(password); await page.getByRole("button", { name: "Sign in" }).click(); await page.getByRole("link", { name: "Choose or create Project" }).click(); await page.getByRole("button", { name: "Open workspace" }).first().click();
  await page.getByRole("button", { name: "Find issues" }).click();
  await expect(page).toHaveURL(/project_id=1.*created_from=.*created_to=.*limit=20$/);
  await expect(page.getByText("No new candidates found")).toBeVisible();
  expect(candidateCalls).toBe(1);
});

test("candidate search exposes loading, error and retry states", async ({ page }) => {
  await mockAuth(page);
  let candidateCalls = 0;
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 1, name: "Demo" }] }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true, disabled_reasons: [] } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, statuses: [], assignees: [] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", async (route) => {
    candidateCalls += 1;
    if (candidateCalls === 1) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "BACKLOG_UNAVAILABLE", message: "Backlog provider unavailable." } }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [], filters: { created_from: "2026-07-15", created_to: "2026-07-15", limit: 20, status_ids: [], assignee_ids: [], not_closed: false }, meta: { requested_limit: 20, returned_count: 0, source_rows_scanned: 0, excluded_existing_cis_count: 0, pages_scanned: 0, source_exhausted: true, scan_limit_reached: false, deadline_reached: false, provider_error_code: null } } }) });
  });
  await page.goto("/login?next=%2Fbacklog-issues%3Fproject_id%3D1");
  await page.getByLabel("Email").fill(email); await page.getByLabel("Password").fill(password); await page.getByRole("button", { name: "Sign in" }).click(); await page.getByRole("link", { name: "Choose or create Project" }).click(); await page.getByRole("button", { name: "Open workspace" }).first().click();
  await page.getByRole("button", { name: "Find issues" }).click();
  await expect(page.getByRole("button", { name: "Finding…" })).toBeVisible();
  await expect(page.getByText("Backlog provider unavailable.")).toBeVisible();
  await page.getByRole("button", { name: "Retry search" }).click();
  await expect(page.getByText("No new candidates found")).toBeVisible();
  expect(candidateCalls).toBe(2);
});
