import { expect, test } from "@playwright/test";
import { login, mockAuth, project } from "./support/phase-fixtures";

type SyncJob = {
  id: string; project_id: number; project_name: string; source_issue_key: string; target_issue_key: string;
  job_type: string; direction_from: string; direction_to: string; status: string; created_at: string; success_at?: string | null; last_error?: string | null;
};

const baseJobs: SyncJob[] = [
  { id: "job-failed", project_id: 1, project_name: "Demo", source_issue_key: "BLG-21", target_issue_key: "JRA-34", job_type: "push_issue", direction_from: "CIS", direction_to: "Jira", status: "failed", created_at: "2026-07-15 09:00:00", last_error: "Target transition rejected." },
  { id: "job-pending", project_id: 1, project_name: "Demo", source_issue_key: "BLG-22", target_issue_key: "JRA-35", job_type: "push_issue", direction_from: "CIS", direction_to: "Jira", status: "pending", created_at: "2026-07-15 09:04:00" },
];

async function mockProjects(page: Parameters<typeof mockAuth>[0]) {
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [project] }) }));
}

test("Sync jobs keeps project filter, evidence columns and global refresh in one ledger", async ({ page }) => {
  await mockAuth(page); await mockProjects(page);
  let listCalls = 0; let lastQuery = "";
  await page.route("**/api/v1/sync-jobs**", (route) => {
    const url = new URL(route.request().url()); listCalls += 1; lastQuery = url.search;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: baseJobs }) });
  });
  await login(page, "/sync-jobs?project_id=1");
  await expect(page.getByRole("heading", { name: "Sync job queue" })).toBeVisible();
  await expect.poll(() => lastQuery).toContain("project_id=1");
  const row = page.getByRole("row", { name: /job-failed/ });
  await expect(row).toContainText("BLG-21"); await expect(row).toContainText("JRA-34"); await expect(row).toContainText("Push Issue");
  await expect(row).toContainText("CIS"); await expect(row).toContainText("Jira"); await expect(row).toContainText("Target transition rejected.");
  const beforeRefresh = listCalls;
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("cis-global-refresh")));
  await expect.poll(() => listCalls).toBeGreaterThan(beforeRefresh);
  await page.getByLabel("Sync jobs project").selectOption("");
  await expect(page).not.toHaveURL(/project_id=/);
});

test("Sync job Retry and Cancel retain server rejection, prevent duplicate submit and reload server truth", async ({ page }) => {
  await mockAuth(page); await mockProjects(page);
  let jobs = structuredClone(baseJobs); let retryCalls = 0; let cancelCalls = 0;
  await page.route("**/api/v1/sync-jobs**", async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (request.method() === "POST") {
      const [, , , , id, action] = url.pathname.split("/");
      if (action === "retry") {
        retryCalls += 1;
        if (retryCalls === 1) return route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: { code: "SYNC_JOB_NOT_RETRYABLE", message: "The server rejected this recovery attempt." } }) });
        await new Promise((resolve) => setTimeout(resolve, 120)); jobs = jobs.map((job) => job.id === id ? { ...job, status: "pending", last_error: null } : job);
      }
      if (action === "cancel") { cancelCalls += 1; jobs = jobs.map((job) => job.id === id ? { ...job, status: "cancelled" } : job); }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: jobs.find((job) => job.id === id) }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: jobs }) });
  });
  await login(page, "/sync-jobs");
  const failed = page.getByRole("row", { name: /job-failed/ });
  await failed.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Job job-failed: The server rejected this recovery attempt.")).toBeVisible();
  await failed.getByRole("button", { name: "Retry" }).click();
  await expect(failed.getByRole("button", { name: "Working…" })).toBeDisabled();
  await expect.poll(() => retryCalls).toBe(2);
  await expect(failed).toContainText("pending");
  await expect(page.getByRole("status")).toContainText("queued for retry");
  const pending = page.getByRole("row", { name: /job-pending/ });
  await pending.getByRole("button", { name: "Cancel" }).click();
  await expect.poll(() => cancelCalls).toBe(1);
  await expect(pending).toContainText("cancelled");
});

test("Sync journal is project-filtered read-only audit evidence", async ({ page }) => {
  await mockAuth(page); await mockProjects(page);
  let lastQuery = ""; let mutationCalls = 0;
  const entries = [{ id: 71, sync_job_id: "job-failed", project_id: 1, project_name: "Demo", source_issue_key: "BLG-21", target_issue_key: "JRA-34", action: "job_failed", status: "failed", direction_from: "CIS", direction_to: "Jira", created_at: "2026-07-15 09:01:00", error_message: "Target transition rejected." }];
  await page.route("**/api/v1/sync-journal**", (route) => {
    const request = route.request(); const url = new URL(request.url()); lastQuery = url.search;
    if (request.method() !== "GET") mutationCalls += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: entries }) });
  });
  await login(page, "/journal?project_id=1");
  await expect(page.getByRole("heading", { name: "Sync journal", exact: true })).toBeVisible();
  await expect.poll(() => lastQuery).toContain("project_id=1");
  const row = page.getByRole("row", { name: /#71/ });
  await expect(row).toContainText("job-failed"); await expect(row).toContainText("Job Failed"); await expect(row).toContainText("Target transition rejected.");
  await expect(page.getByRole("button", { name: /Retry|Cancel/ })).toHaveCount(0); expect(mutationCalls).toBe(0);
  await page.getByLabel("Sync journal project").selectOption("");
  await expect(page).not.toHaveURL(/project_id=/);
});

test("Operation ledgers expose loading, error retry, empty and mobile keyboard actions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await mockAuth(page); await mockProjects(page);
  let jobLists = 0;
  await page.route("**/api/v1/sync-jobs**", async (route) => {
    jobLists += 1;
    if (jobLists === 1) { await new Promise((resolve) => setTimeout(resolve, 250)); return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "SYNC_UNAVAILABLE", message: "Queue is temporarily unavailable." } }) }); }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
  });
  await login(page, "/sync-jobs");
  await expect(page.getByRole("heading", { name: "Loading sync jobs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sync jobs unavailable" })).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "No sync jobs found" })).toBeVisible();

  await page.route("**/api/v1/sync-journal**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 72, sync_job_id: "job-pending", project_id: 1, project_name: "Demo", source_issue_key: "BLG-22", target_issue_key: "JRA-35", action: "job_queued", status: "pending", direction_from: "CIS", direction_to: "Jira", created_at: "2026-07-15 09:04:00" }] }) }));
  await page.goto("/journal");
  const row = page.getByRole("row", { name: /#72/ });
  await expect(row).toHaveCSS("display", "block");
  await page.getByLabel("Sync journal project").focus(); await expect(page.getByLabel("Sync journal project")).toBeFocused();
});
