import { expect, Page, test } from "@playwright/test";

const email = "admin-ui@example.test";
const password = "verify-password";

async function mockAuth(page: Page) {
  await page.route("**/api/v1/auth/me", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { admin: { id: 1, email } } }) }));
  await page.route("**/api/v1/dashboard/summary", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { health: { status: "ok", database: "ok" }, counts: { pull_jobs_pending: 2, pull_jobs_failed: 0, translation_pending: 1, issue_pending_mapping: 3, sync_jobs_failed: 0, anomaly_open: 1 } } }) }));
  await page.route("**/api/v1/dashboard/alerts", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.route("**/api/v1/auth/login", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    if (body.password !== password) {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "e2e-token", admin: { id: 1, email } } }) });
  });
}

test("protected deep-link redirects to login and returns to dashboard", async ({ page }) => {
  await mockAuth(page);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
  await expect(page.getByText("Pull pending")).toBeVisible();
  await expect(page.locator(".metric-card")).toHaveCount(6);
  await expect(page.locator(".metric-card__rule")).toHaveCount(6);
  await expect(page.getByText("No open alerts.")).toBeVisible();
  await expect(page.getByRole("complementary").getByText("CIS Console")).toBeVisible();
  await expect(page.locator(".nav-link--active").first()).toHaveCSS("background-color", "rgb(239, 246, 255)");
  await expect(page.locator(".badge--good")).toHaveCSS("background-color", "rgb(236, 253, 243)");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".app-shell")).toHaveCSS("background-color", "rgb(11, 18, 32)");
  await expect(page.locator(".surface").first()).toHaveCSS("background-color", "rgb(17, 28, 47)");
  await expect(page.locator(".nav-link--active").first()).toHaveCSS("background-color", "rgb(23, 37, 84)");
  await expect(page.locator(".badge--good")).toHaveCSS("background-color", "rgb(18, 53, 47)");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".app-shell")).toHaveCSS("background-color", "rgb(246, 247, 251)");
});

test("invalid credentials preserve email and reject external intended path", async ({ page }) => {
  await mockAuth(page);
  await page.goto("/login?next=https%3A%2F%2Fevil.test");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await expect(page.getByRole("alert").filter({ hasText: "Invalid email or password." })).toBeVisible();
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("mobile navigation keeps console routes reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAuth(page);
  await page.goto("/login?next=%2Fdashboard");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByLabel("Open navigation").click();
  const navigation = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Translation Glossary" })).toBeVisible();
});

test("tablet navigation keeps the primary route list visible", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await mockAuth(page);
  await page.goto("/login?next=%2Fdashboard");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  const navigation = page.getByRole("navigation", { name: "Primary" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Backlog Issues" })).toBeVisible();
});
