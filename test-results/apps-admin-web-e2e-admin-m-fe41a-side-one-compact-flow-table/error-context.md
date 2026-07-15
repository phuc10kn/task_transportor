# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps\admin-web\e2e\admin-mpa.spec.js >> mappings group values by field inside one compact flow table
- Location: apps\admin-web\e2e\admin-mpa.spec.js:77:1

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/mappings?project_id=1", waiting until "load"

```

# Test source

```ts
  1   | "use strict";
  2   | 
  3   | const { expect, test } = require("@playwright/test");
  4   | 
  5   | const project = { id: 1, name: "Demo Hub", enabled: true, source_language: "ja", target_language: "vi", backlog_issue_key_prefix: "BLG" };
  6   | 
  7   | async function mockSession(page, projects = [project]) {
  8   |   await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "mpa-token", admin: { id: 1, email: "admin@example.test" } } }) }));
  9   |   await page.route("**/api/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { admin: { id: 1, email: "admin@example.test" } } }) }));
  10  |   await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: projects }) }));
  11  | }
  12  | 
  13  | async function enter(page, path, projects = [project]) {
  14  |   await mockSession(page, projects);
  15  |   await page.addInitScript(({ path }) => {
  16  |     localStorage.setItem("cis_admin_token", "mpa-token");
  17  |     sessionStorage.setItem("cis_active_project_id", "1");
  18  |     window.__expectedPath = path;
  19  |   }, { path });
> 20  |   await page.goto(path);
      |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  21  | }
  22  | 
  23  | test("real URL navigation: login, Project gate and full-document routes", async ({ page }) => {
  24  |   await mockSession(page);
  25  |   await page.goto("/backlog-issues");
  26  |   await expect(page).toHaveURL(/\/login\?next=%2Fbacklog-issues/);
  27  |   await page.getByLabel("Email").fill("admin@example.test");
  28  |   await page.getByLabel("Password").fill("secret");
  29  |   await page.getByRole("button", { name: "Sign in" }).click();
  30  |   await expect(page.getByRole("heading", { name: "Choose a Project first" })).toBeVisible();
  31  |   await page.getByRole("link", { name: "Choose or create Project" }).click();
  32  |   await page.getByRole("button", { name: "Open workspace" }).click();
  33  |   await expect(page).toHaveURL(/\/backlog-issues\?project_id=1$/);
  34  |   await expect(page.getByText("Demo Hub · #1")).toBeVisible();
  35  |   await page.getByRole("link", { name: "Projects", exact: true }).click();
  36  |   await expect(page).toHaveURL(/\/projects$/);
  37  |   await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  38  |   const lightSidebar = await page.locator(".navbar-vertical").evaluate((element) => getComputedStyle(element).backgroundColor);
  39  |   await page.getByRole("button", { name: "Switch to dark mode" }).click();
  40  |   await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  41  |   await expect.poll(() => page.locator(".navbar-vertical").evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(lightSidebar);
  42  | });
  43  | 
  44  | test("backlog: explicit browse and async Sync to CIS + Translate", async ({ page }) => {
  45  |   await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: true }, sync_to_cis: { enabled: true } } } }) }));
  46  |   await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [{ id: 1, name: "Open" }, { id: 2, name: "Resolved" }], assignees: [{ id: 10, name: "Chanaka" }, { id: 11, name: "D.M.Phuc" }] } }) }));
  47  |   await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-7", summary: "New customer issue", status: "Open", assignee: null, created_at_source: "2026-07-16T00:00:00Z" }], meta: { returned_count: 1, source_rows_scanned: 1, stop_reason: "source_exhausted" } } }) }));
  48  |   await page.route("**/api/v1/projects/1/backlog/issues/BLG-7/sync-to-cis", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { outcome: "queued", with_translation: true, job: { id: "job-7", status: "pending" } } }) }));
  49  |   await page.route("**/api/v1/sync-jobs/job-7", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "job-7", status: "success" } }) }));
  50  |   await enter(page, "/backlog-issues?project_id=1&submitted=1&created_from=2026-07-01&created_to=2026-07-16&limit=20&status_id=1&assignee_id=10");
  51  |   await expect(page.locator('select[multiple]')).toHaveCount(0);
  52  |   const statusFilter = page.getByRole("group", { name: "Status filter" });
  53  |   await expect(statusFilter).toContainText("Open");
  54  |   await expect(page.getByRole("group", { name: "Assignee filter" })).toContainText("Chanaka");
  55  |   await statusFilter.locator("summary").click();
  56  |   await statusFilter.getByRole("checkbox", { name: "Resolved" }).check();
  57  |   await statusFilter.getByRole("button", { name: "Done" }).click();
  58  |   await expect(statusFilter.locator("summary")).toContainText("Open, Resolved");
  59  |   await expect(page.getByRole("cell", { name: "BLG-7" })).toBeVisible();
  60  |   await page.getByRole("button", { name: "Sync + Translate" }).click();
  61  |   await expect(page.getByText(/Job job-7: success.*Review Translation Queue/)).toBeVisible();
  62  | });
  63  | 
  64  | test("backlog explains empty candidate results and clears only optional filters", async ({ page }) => {
  65  |   await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: true }, sync_to_cis: { enabled: true } } } }) }));
  66  |   await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [{ id: 2, name: "STG化OK" }], assignees: [{ id: 11, name: "D.M.Phuc" }] } }) }));
  67  |   await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [], meta: { returned_count: 0, source_rows_scanned: 0, excluded_existing_cis_count: 0, stop_reason: "source_exhausted" } } }) }));
  68  |   await enter(page, "/backlog-issues?project_id=1&submitted=1&created_from=2026-05-01&created_to=2026-07-15&limit=20&status_id=2&assignee_id=11&not_closed=true");
  69  |   await expect(page.getByRole("heading", { name: "No source issues match these filters" })).toBeVisible();
  70  |   await expect(page.getByLabel("Active optional filters")).toContainText("Status: STG化OK");
  71  |   await expect(page.getByLabel("Active optional filters")).toContainText("Assignee: D.M.Phuc");
  72  |   const clear = page.getByRole("link", { name: "Clear optional filters and search" });
  73  |   await expect(clear).toHaveAttribute("href", /created_from=2026-05-01.*created_to=2026-07-15.*limit=20/);
  74  |   await expect(clear).not.toHaveAttribute("href", /status_id|assignee_id|not_closed/);
  75  | });
  76  | 
  77  | test("mappings group values by field inside one compact flow table", async ({ page }) => {
  78  |   await page.route("**/api/v1/mapping-settings**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { flows: { systems_to_cis: [
  79  |     { project_id: 1, mapping_type: "issue_type", mapping_label: "Issue type", from_value: "bug", from_label: "Bug", to_value: "task", required_for_jira: true, issue_count: 3, cis_values: [{ value: "task", label: "Task" }, { value: "bug", label: "Bug" }] },
  80  |     { project_id: 1, mapping_type: "issue_type", mapping_label: "Issue type", from_value: "feature", from_label: "Feature", to_value: "task", required_for_jira: true, issue_count: 2, cis_values: [{ value: "task", label: "Task" }] },
  81  |     { project_id: 1, mapping_type: "priority", mapping_label: "Priority", from_value: "high", from_label: "High", to_value: "high", required_for_jira: true, issue_count: 1, cis_values: [{ value: "high", label: "High" }] },
  82  |   ], cis_to_system: [] } } }) }));
  83  |   await enter(page, "/mappings?project_id=1");
  84  |   const sourceFlow = page.locator('[data-mapping-flow="source"]');
  85  |   await expect(sourceFlow.locator("table")).toHaveCount(1);
  86  |   await expect(sourceFlow.locator("[data-mapping-group]")).toHaveCount(2);
  87  |   const issueTypeGroup = sourceFlow.locator('[data-mapping-group="source:issue_type"]');
  88  |   await expect(issueTypeGroup.getByRole("button", { name: /Issue type.*2 values.*5 issues/ })).toBeVisible();
  89  |   await issueTypeGroup.getByRole("button", { name: /Issue type/ }).click();
  90  |   await expect(issueTypeGroup.locator("[data-mapping]:visible")).toHaveCount(0);
  91  |   await issueTypeGroup.getByRole("button", { name: /Issue type/ }).click();
  92  |   await expect(issueTypeGroup.locator("[data-mapping]:visible")).toHaveCount(2);
  93  |   const bug = page.locator('[data-mapping="source:issue_type:bug"]');
  94  |   await expect(bug.getByRole("button", { name: "Save" })).toBeDisabled();
  95  |   await bug.getByRole("combobox").selectOption("bug");
  96  |   await expect(bug.getByRole("button", { name: "Save" })).toBeEnabled();
  97  | });
  98  | 
  99  | test("issue-editor: canonical surface and blocked Jira dry-run", async ({ page }) => {
  100 |   const longSource = `## Source detail\n\n${Array.from({ length: 14 }, (_, index) => `Source paragraph ${index + 1}: evidence remains available when the panel expands.`).join("\n\n")}`;
  101 |   const editor = { issue: { id: "issue-1", project_id: 1, sync_status: "pending_mapping", current_revision: 2 }, canonical: { summary: { value: "Canonical", source: "manual" }, description: { value: "## Details\n\nBody\n\n<script>alert('x')</script>", source: "manual" } }, sources: { summary: { cis: "Canonical", backlog: "Source summary", jira: "Target summary" }, description: { cis: "## CIS detail\n\nCanonical evidence", backlog: longSource, jira: "## Jira detail\n\nTarget evidence" }, priority: { cis: "Medium", backlog: "Normal", jira: "Medium" }, status: { cis: "In Review", backlog: "Resolved", jira: "In Review" } }, field_meta: { catalogs: {} }, translations: [{ id: 7, target_field: "description", source_text: "## Source\n\n**Original**", ai_draft: "## Draft\n\n**Translated**", review_status: "ai_draft" }], translation: { total: 1 }, sync: { canonical_hash: "1234567890abcdef" } };
  102 |   await page.route("**/api/v1/issues/issue-1/editor", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: editor }) }));
  103 |   await page.route("**/api/v1/issues/issue-1/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  104 |   await page.route("**/api/v1/issues/issue-1/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  105 |   await page.route("**/api/v1/issues/issue-1/dry-run/jira", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { can_sync: false, payload: { fields: { summary: "Canonical" } }, validation: { errors: [{ code: "MAPPING_REQUIRED", message: "Required mapping is missing." }] }, warnings: [] } }) }));
  106 |   await enter(page, "/cis-issues/issue-1");
  107 |   await expect(page.getByRole("heading", { name: "Issue Editor" })).toBeVisible();
  108 |   await expect(page.locator("#canonical-summary").locator("..")).toHaveClass(/col-12/);
  109 |   const description = page.locator("#canonical-description");
  110 |   const canonicalEditor = page.locator("[data-markdown-editor]").filter({ has: description });
  111 |   await description.evaluate((element) => {
  112 |     const start = element.value.indexOf("Body");
  113 |     element.setSelectionRange(start, start + "Body\n\n".length);
  114 |   });
  115 |   await canonicalEditor.getByRole("button", { name: "Bold" }).click();
  116 |   await expect(description).toHaveValue("## Details\n\n**Body**\n\n<script>alert('x')</script>");
  117 |   await canonicalEditor.getByRole("tab", { name: "Preview" }).click();
  118 |   const preview = canonicalEditor.locator('[data-md-panel="preview"]');
  119 |   await expect(preview.getByRole("heading", { name: "Details" })).toBeVisible();
  120 |   await expect(preview.getByText("Body", { exact: true })).toBeVisible();
```