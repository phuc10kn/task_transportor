import { Page } from "@playwright/test";

export const email = "admin-ui@example.test";
export const password = "verify-password";
export const project = { id: 1, name: "Demo", source_language: "ja", target_language: "vi" };

export async function mockAuth(page: Page) {
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { admin: { id: 1, email } } }) }));
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "phase-token", admin: { id: 1, email } } }) }));
}

export async function login(page: Page, path: string) {
  await page.goto(`/login?next=${encodeURIComponent(path)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
