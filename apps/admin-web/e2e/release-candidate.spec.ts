import { expect, test } from "@playwright/test";
import { login, mockAuth } from "./support/phase-fixtures";

const axePath = require.resolve("axe-core/axe.min.js");
const routes = ["/dashboard", "/projects", "/mappings", "/backlog-issues", "/cis-issues", "/translation-queue", "/translation-glossary", "/anomalies", "/sync-jobs", "/journal"];

async function mockDashboard(page: Parameters<typeof mockAuth>[0]) {
  let reads = 0;
  await page.route("**/api/v1/dashboard/summary", (route) => {
    reads += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { health: { status: "ok", database: "ok" }, counts: { pull_jobs_pending: 2, pull_jobs_failed: 0, translation_pending: 1, issue_pending_mapping: 3, sync_jobs_failed: 0, anomaly_open: 1 } } }) });
  });
  await page.route("**/api/v1/dashboard/alerts", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  return () => reads;
}

test("release candidate shell reaches every active route and Refresh only re-reads the current route", async ({ page }) => {
  await mockAuth(page); const reads = await mockDashboard(page);
  await login(page, "/dashboard");
  const navigation = page.getByRole("navigation", { name: "Primary" });
  await expect(navigation.getByRole("link")).toHaveCount(routes.length);
  for (const href of routes) await expect(navigation.locator(`a[href="${href}"]`)).toBeVisible();
  const before = reads();
  await page.getByRole("button", { name: "Refresh current route" }).click();
  await expect.poll(reads).toBeGreaterThan(before);
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("release candidate shell has viewport fit, 44px touch targets, reduced motion and selected axe WCAG A/AA", async ({ page }) => {
  await mockAuth(page); await mockDashboard(page);
  await login(page, "/dashboard");
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Open navigation").click();
  const targets = await page.locator(".ui-button:visible, .nav-link:visible").evaluateAll((elements) => elements.map((element) => { const box = element.getBoundingClientRect(); return Math.min(box.width, box.height); }));
  expect(targets.every((size) => size >= 44)).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" }); await page.reload();
  await expect(page.locator(".ui-button").first()).toHaveCSS("transition-duration", "0.001s");
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => (await (window as unknown as Window & { axe: { run: (context: Document, options: unknown) => Promise<{ violations: unknown[] }> } }).axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } })).violations);
  expect(violations).toEqual([]);
});
