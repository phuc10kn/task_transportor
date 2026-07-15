import { expect, Page, test } from "@playwright/test";

const email = "admin-ui@example.test";
const password = "verify-password";

async function mockAuth(page: Page) {
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { admin: { id: 1, email } } }) }));
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 1, name: "Demo", source_language: "ja", target_language: "vi", enabled: true }] }) }));
  await page.route("**/api/v1/auth/login", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    if (body.password !== password) return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "e2e-token", admin: { id: 1, email } } }) });
  });
}

test("protected deep-link redirects to login and then the Project gate", async ({ page }) => {
  await mockAuth(page);
  await page.goto("/backlog-issues");
  await expect(page).toHaveURL(/\/login\?next=%2Fbacklog-issues/);
  await page.getByLabel("Email").fill(email); await page.getByLabel("Password").fill(password); await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/backlog-issues$/);
  await expect(page.getByRole("heading", { name: "Choose a Project first" })).toBeVisible();
  await expect(page.getByText("Choose or create Project")).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click(); await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload(); await expect(page.getByRole("heading", { name: "Choose a Project first" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click(); await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("invalid credentials preserve email and reject external intended path", async ({ page }) => {
  await mockAuth(page); await page.goto("/login?next=https%3A%2F%2Fevil.test");
  await page.getByLabel("Email").fill(email); await page.getByLabel("Password").fill("wrong-password"); await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByLabel("Email")).toHaveValue(email); await expect(page.getByRole("alert").filter({ hasText: "Invalid email or password." })).toBeVisible();
  await page.getByLabel("Password").fill(password); await page.getByRole("button", { name: "Sign in" }).click(); await expect(page).toHaveURL(/\/backlog-issues$/);
});

test("mobile navigation keeps Project and disabled routes understandable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await mockAuth(page); await page.goto("/login?next=%2Fbacklog-issues");
  await page.getByLabel("Email").fill(email); await page.getByLabel("Password").fill(password); await page.getByRole("button", { name: "Sign in" }).click(); await page.getByLabel("Open navigation").click();
  const navigation = page.getByRole("navigation", { name: "Mobile primary" }); await expect(navigation).toBeVisible(); await expect(navigation.getByRole("link", { name: "Projects" })).toBeVisible(); await expect(navigation.getByText("Translation Glossary")).toBeVisible();
});

test("tablet navigation keeps the primary route list visible", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await mockAuth(page); await page.goto("/login?next=%2Fbacklog-issues");
  await page.getByLabel("Email").fill(email); await page.getByLabel("Password").fill(password); await page.getByRole("button", { name: "Sign in" }).click();
  const navigation = page.getByRole("navigation", { name: "Primary" }); await expect(navigation).toBeVisible(); await expect(navigation.getByText("Backlog Issues")).toBeVisible();
});
