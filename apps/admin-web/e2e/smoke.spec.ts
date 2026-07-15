import { expect, test } from "@playwright/test";

test("login route renders and API proxy target is reachable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Operations Console" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Verify API proxy" })).toHaveAttribute("href", "/api/v1/health");
});
