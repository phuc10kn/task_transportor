import { expect, test } from "@playwright/test";

const email = "workspace@example.test";
const password = "verify-password";
const project = { id: 1, name: "Demo", source_language: "ja", target_language: "vi", enabled: true };

async function mockAuth(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { admin: { id: 1, email } } }) }));
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "workspace-token", admin: { id: 1, email } } }) }));
}

async function login(page: import("@playwright/test").Page, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("login gates business route, then explicit Project open binds request", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [project] }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: true }, sync_to_cis: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, statuses: [], assignees: [] } }) }));

  await login(page, "/backlog-issues");
  await expect(page.getByRole("heading", { name: "Choose a Project first" })).toBeVisible();
  await page.getByRole("link", { name: "Choose or create Project" }).click();
  await expect(page).toHaveURL(/\/projects\?next=%2Fbacklog-issues$/);
  await expect(page.getByRole("button", { name: "Open workspace" })).toBeVisible();
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/backlog-issues\?project_id=1$/);
  await expect(page.getByText("Demo · #1").first()).toBeVisible();
  await expect(page.getByText("Browse ready")).toBeVisible();
});

test("Dashboard is disabled and sends no summary or alerts request", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [project] }) }));
  const dashboardRequests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/api/v1/dashboard/")) dashboardRequests.push(request.url()); });
  await login(page, "/backlog-issues");
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard is temporarily disabled" })).toBeVisible();
  expect(dashboardRequests).toEqual([]);
  await expect(page.getByText("Chờ BE project scope").first()).toBeVisible();
});

test("disabled Project cannot open workspace", async ({ page }) => {
  await mockAuth(page);
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 2, name: "Disabled", enabled: false }] }) }));
  await login(page, "/backlog-issues");
  await expect(page.getByRole("heading", { name: "Choose a Project first" })).toBeVisible();
  await page.getByRole("link", { name: "Choose or create Project" }).click();
  await expect(page.getByRole("button", { name: "Workspace disabled" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Workspace disabled" })).toHaveAttribute("title", "Bật Project trong cấu hình trước khi mở workspace");
});
