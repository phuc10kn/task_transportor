import { expect, test } from "@playwright/test";
import { login, mockAuth, project } from "./support/phase-fixtures";

type Anomaly = {
  id: number;
  project_id: number;
  issue_id: string | null;
  anomaly_type: string;
  severity: string;
  status: string;
  details_json: Record<string, unknown>;
  ai_analysis?: string | null;
  created_at: string;
  resolved_at?: string | null;
  resolved_by?: number | null;
};

const baseAnomalies: Anomaly[] = [
  { id: 17, project_id: 1, issue_id: "issue-17", anomaly_type: "unusual_field_change", severity: "critical", status: "open", details_json: { field: "description", previous_hash: "sha256:old", observed_delta: { lines: 14 } }, ai_analysis: "Large target-facing content change.", created_at: "2026-07-15 09:10:00" },
  { id: 18, project_id: 1, issue_id: "issue-18", anomaly_type: "mapping_gap", severity: "warning", status: "investigating", details_json: { mapping_type: "status", source_value: "Blocked" }, created_at: "2026-07-15 09:20:00" },
];

async function mockProjects(page: Parameters<typeof mockAuth>[0]) {
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [project] }) }));
}

test("Anomalies keeps URL filters, trace evidence and Keep open as a zero-mutation decision", async ({ page }) => {
  await mockAuth(page); await mockProjects(page);
  let listCalls = 0; let detailCalls = 0; let mutationCalls = 0; let lastQuery = "";
  await page.route("**/api/v1/anomalies**", async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (request.method() === "POST") { mutationCalls += 1; return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: { code: "UNEXPECTED_MUTATION", message: "Keep open must not mutate." } }) }); }
    if (url.pathname === "/api/v1/anomalies") {
      listCalls += 1; lastQuery = url.search;
      const filtered = baseAnomalies.filter((item) => (!url.searchParams.get("project_id") || String(item.project_id) === url.searchParams.get("project_id")) && (!url.searchParams.get("status") || item.status === url.searchParams.get("status")) && (!url.searchParams.get("anomaly_type") || item.anomaly_type === url.searchParams.get("anomaly_type")));
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: filtered }) });
    }
    detailCalls += 1;
    const id = Number(url.pathname.split("/").at(-1));
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: baseAnomalies.find((item) => item.id === id) }) });
  });

  await login(page, "/anomalies?project_id=1&status=open&anomaly_type=unusual_field_change");
  await expect(page.getByRole("heading", { name: "Anomaly control room" })).toBeVisible();
  await expect.poll(() => lastQuery).toContain("project_id=1");
  expect(lastQuery).toContain("status=open"); expect(lastQuery).toContain("anomaly_type=unusual_field_change");
  const row = page.getByRole("row", { name: /#17/ });
  await expect(row).toContainText("issue-17"); await expect(row).toContainText("Unusual Field Change"); await expect(row).toContainText("Previous Hash");
  await row.getByRole("button", { name: "Open anomaly 17" }).click();
  const dialog = page.getByRole("dialog", { name: "Anomaly 17 details" });
  await expect(dialog.getByLabel("Risk triage rail")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "issue-17" })).toHaveAttribute("href", "/cis-issues/issue-17");
  await expect(dialog).toContainText("Large target-facing content change.");
  await dialog.getByRole("button", { name: "Keep open" }).click();
  await expect(dialog).not.toBeVisible(); expect(mutationCalls).toBe(0);

  await row.getByRole("button", { name: "Open anomaly 17" }).click();
  const detailsBeforeRefresh = detailCalls; const listBeforeRefresh = listCalls;
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("cis-global-refresh", { detail: { pathname: "/anomalies" } })));
  await expect.poll(() => detailCalls).toBeGreaterThan(detailsBeforeRefresh);
  await expect.poll(() => listCalls).toBeGreaterThan(listBeforeRefresh);
  await expect(page.getByRole("dialog", { name: "Anomaly 17 details" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByLabel("Anomaly type").selectOption("");
  await expect(page).not.toHaveURL(/anomaly_type=/);
  await page.getByLabel("Anomaly status").selectOption("investigating");
  await expect(page).toHaveURL(/status=investigating/);
  await expect(page.getByRole("row", { name: /#18/ })).toBeVisible();
});

test("Resolve and Ignore use current endpoints, prevent duplicate submit and refresh server truth", async ({ page }) => {
  await mockAuth(page); await mockProjects(page);
  let anomalies = structuredClone(baseAnomalies);
  let resolveCalls = 0; let ignoreCalls = 0; let failResolve = true;
  await page.route("**/api/v1/anomalies**", async (route) => {
    const request = route.request(); const url = new URL(request.url()); const parts = url.pathname.split("/");
    if (request.method() === "POST") {
      const id = Number(parts.at(-2)); const action = parts.at(-1);
      if (action === "resolve") {
        resolveCalls += 1;
        if (failResolve) { failResolve = false; return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: { code: "ANOMALY_CONFLICT", message: "Server state changed; review evidence again." } }) }); }
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      if (action === "ignore") ignoreCalls += 1;
      anomalies = anomalies.map((item) => item.id === id ? { ...item, status: action === "resolve" ? "resolved" : "ignored", resolved_at: "2026-07-15 10:00:00", resolved_by: 1 } : item);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: anomalies.find((item) => item.id === id) }) });
    }
    if (url.pathname === "/api/v1/anomalies") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: anomalies }) });
    const id = Number(parts.at(-1));
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: anomalies.find((item) => item.id === id) }) });
  });

  await login(page, "/anomalies");
  await page.getByRole("button", { name: "Open anomaly 17" }).click();
  let dialog = page.getByRole("dialog", { name: "Anomaly 17 details" });
  await dialog.getByRole("button", { name: "Resolve", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Server state changed");
  await expect(dialog).toContainText("Previous Hash");
  await dialog.getByRole("button", { name: "Resolve", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Resolving…" })).toBeDisabled();
  await expect.poll(() => resolveCalls).toBe(2);
  await expect(dialog.getByText("resolved", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Anomaly #17 resolved");
  await dialog.getByRole("button", { name: "Keep open" }).click();
  await expect(page.getByRole("row", { name: /#17/ })).toContainText("resolved");

  await page.getByRole("button", { name: "Open anomaly 18" }).click();
  dialog = page.getByRole("dialog", { name: "Anomaly 18 details" });
  await dialog.getByRole("button", { name: "Ignore", exact: true }).click();
  await expect.poll(() => ignoreCalls).toBe(1);
  await expect(dialog.getByText("ignored", { exact: true })).toBeVisible();
});

test("Anomalies exposes loading, error retry and empty states", async ({ page }) => {
  await mockAuth(page); await mockProjects(page);
  let listCalls = 0;
  await page.route("**/api/v1/anomalies**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname !== "/api/v1/anomalies") return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: { code: "NOT_FOUND", message: "Not found" } }) });
    listCalls += 1;
    if (listCalls === 1) { await new Promise((resolve) => setTimeout(resolve, 1200)); return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "ANOMALY_UNAVAILABLE", message: "Anomaly store is temporarily unavailable." } }) }); }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
  });
  await login(page, "/anomalies");
  await expect(page.getByRole("heading", { name: "Loading anomalies" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Anomalies unavailable" })).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: "No anomalies found" })).toBeVisible();
});

test("Anomaly decision surface is keyboard-safe and mobile actions remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAuth(page); await mockProjects(page);
  await page.route("**/api/v1/anomalies**", (route) => {
    const url = new URL(route.request().url()); const id = Number(url.pathname.split("/").at(-1));
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: url.pathname === "/api/v1/anomalies" ? [baseAnomalies[0]] : baseAnomalies.find((item) => item.id === id) }) });
  });
  await login(page, "/anomalies");
  const row = page.getByRole("row", { name: /#17/ });
  await expect(row).toHaveCSS("display", "block");
  const trigger = row.getByRole("button", { name: "Open anomaly 17" });
  await trigger.focus(); await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Anomaly 17 details" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "issue-17" })).toBeFocused();
  await expect(dialog.getByRole("button", { name: "Resolve", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible(); await expect(trigger).toBeFocused();
});
