import { expect, test } from "@playwright/test";
import { login, mockAuth } from "./support/phase-fixtures";

const axePath = require.resolve("axe-core/axe.min.js");
const routes = ["/projects", "/mappings", "/backlog-issues", "/cis-issues", "/translation-queue", "/translation-glossary", "/anomalies", "/sync-jobs", "/journal"];

async function mockBacklogContext(page: Parameters<typeof mockAuth>[0]) {
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: true }, sync_to_cis: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { project_id: 1, statuses: [], assignees: [] } }) }));
}

test("release candidate shell reaches every active route and Refresh only re-reads the current route", async ({ page }) => {
  await mockAuth(page);
  await mockBacklogContext(page);
  let projectReads = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/projects/1/")) projectReads += 1;
  });
  await login(page, "/dashboard");
  const navigation = page.getByRole("navigation", { name: "Primary" });
  const navHrefs = await navigation.getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(navHrefs).toEqual(routes);
  expect(await navigation.locator(".nav-link--disabled").filter({ hasText: "Dashboard" }).count()).toBe(1);
  const before = projectReads;
  await page.getByRole("button", { name: "Refresh current route" }).click();
  await expect.poll(() => projectReads).toBeGreaterThan(before);
  await expect(page).toHaveURL(/\/backlog-issues(?:\?.*)?$/);
});

test("release candidate shell has viewport fit, 44px touch targets, reduced motion and selected axe WCAG A/AA", async ({ page }) => {
  await mockAuth(page);
  await mockBacklogContext(page);
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
