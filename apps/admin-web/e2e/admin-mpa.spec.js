"use strict";

const { expect, test } = require("@playwright/test");

const project = { id: 1, name: "Demo Hub", enabled: true, source_language: "ja", target_language: "vi", backlog_issue_key_prefix: "BLG" };

async function mockSession(page, projects = [project]) {
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "mpa-token", admin: { id: 1, email: "admin@example.test" } } }) }));
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { admin: { id: 1, email: "admin@example.test" } } }) }));
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: projects }) }));
}

async function enter(page, path, projects = [project]) {
  await mockSession(page, projects);
  await page.addInitScript(({ path }) => {
    localStorage.setItem("cis_admin_token", "mpa-token");
    sessionStorage.setItem("cis_active_project_id", "1");
    window.__expectedPath = path;
  }, { path });
  await page.goto(path);
}

test("real URL navigation: login, Project gate and full-document routes", async ({ page }) => {
  await mockSession(page);
  await page.goto("/backlog-issues");
  await expect(page).toHaveURL(/\/login\?next=%2Fbacklog-issues/);
  await page.getByLabel("Email").fill("admin@example.test");
  await page.getByLabel("Password").fill("secret");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Choose a Project first" })).toBeVisible();
  await page.getByRole("link", { name: "Choose or create Project" }).click();
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/backlog-issues\?project_id=1$/);
  await expect(page.getByText("Demo Hub · #1")).toBeVisible();
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  const lightSidebar = await page.locator(".navbar-vertical").evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.locator(".navbar-vertical").evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(lightSidebar);
});

test("backlog: explicit browse and async Sync to CIS + Translate", async ({ page }) => {
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: true }, sync_to_cis: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [{ id: 1, name: "Open" }, { id: 2, name: "Resolved" }], assignees: [{ id: 10, name: "Chanaka" }, { id: 11, name: "D.M.Phuc" }] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [{ backlog_issue_key: "BLG-7", summary: "New customer issue", status: "Open", assignee: null, created_at_source: "2026-07-16T00:00:00Z" }], meta: { returned_count: 1, source_rows_scanned: 1, stop_reason: "source_exhausted" } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/BLG-7/sync-to-cis", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { outcome: "queued", with_translation: true, job: { id: "job-7", status: "pending" } } }) }));
  await page.route("**/api/v1/sync-jobs/job-7", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "job-7", status: "success" } }) }));
  await enter(page, "/backlog-issues?project_id=1&submitted=1&created_from=2026-07-01&created_to=2026-07-16&limit=20&status_id=1&assignee_id=10");
  await expect(page.locator('select[multiple]')).toHaveCount(0);
  const statusFilter = page.getByRole("group", { name: "Status filter" });
  await expect(statusFilter).toContainText("Open");
  await expect(page.getByRole("group", { name: "Assignee filter" })).toContainText("Chanaka");
  await statusFilter.locator("summary").click();
  await statusFilter.getByRole("checkbox", { name: "Resolved" }).check();
  await statusFilter.getByRole("button", { name: "Done" }).click();
  await expect(statusFilter.locator("summary")).toContainText("Open, Resolved");
  await expect(page.getByRole("cell", { name: "BLG-7" })).toBeVisible();
  await page.getByRole("button", { name: "Sync + Translate" }).click();
  await expect(page.getByText(/Job job-7: success.*Review Translation Queue/)).toBeVisible();
});

test("backlog explains empty candidate results and clears only optional filters", async ({ page }) => {
  await page.route("**/api/v1/projects/1/backlog/issues/action-readiness", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { actions: { browse: { enabled: true }, pull_one: { enabled: true }, pull_project: { enabled: true }, sync_to_cis: { enabled: true } } } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/filter-options", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { statuses: [{ id: 2, name: "STG化OK" }], assignees: [{ id: 11, name: "D.M.Phuc" }] } }) }));
  await page.route("**/api/v1/projects/1/backlog/issues/candidates**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { candidates: [], meta: { returned_count: 0, source_rows_scanned: 0, excluded_existing_cis_count: 0, stop_reason: "source_exhausted" } } }) }));
  await enter(page, "/backlog-issues?project_id=1&submitted=1&created_from=2026-05-01&created_to=2026-07-15&limit=20&status_id=2&assignee_id=11&not_closed=true");
  await expect(page.getByRole("heading", { name: "No source issues match these filters" })).toBeVisible();
  await expect(page.getByLabel("Active optional filters")).toContainText("Status: STG化OK");
  await expect(page.getByLabel("Active optional filters")).toContainText("Assignee: D.M.Phuc");
  const clear = page.getByRole("link", { name: "Clear optional filters and search" });
  await expect(clear).toHaveAttribute("href", /created_from=2026-05-01.*created_to=2026-07-15.*limit=20/);
  await expect(clear).not.toHaveAttribute("href", /status_id|assignee_id|not_closed/);
});

test("mappings group values by field inside one compact flow table", async ({ page }) => {
  await page.route("**/api/v1/mapping-settings**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { flows: { systems_to_cis: [
    { project_id: 1, mapping_type: "issue_type", mapping_label: "Issue type", from_value: "bug", from_label: "Bug", to_value: "task", required_for_jira: true, issue_count: 3, cis_values: [{ value: "task", label: "Task" }, { value: "bug", label: "Bug" }] },
    { project_id: 1, mapping_type: "issue_type", mapping_label: "Issue type", from_value: "feature", from_label: "Feature", to_value: "task", required_for_jira: true, issue_count: 2, cis_values: [{ value: "task", label: "Task" }] },
    { project_id: 1, mapping_type: "priority", mapping_label: "Priority", from_value: "high", from_label: "High", to_value: "high", required_for_jira: true, issue_count: 1, cis_values: [{ value: "high", label: "High" }] },
  ], cis_to_system: [] } } }) }));
  await enter(page, "/mappings?project_id=1");
  const sourceFlow = page.locator('[data-mapping-flow="source"]');
  await expect(sourceFlow.locator("table")).toHaveCount(1);
  await expect(sourceFlow.locator("[data-mapping-group]")).toHaveCount(2);
  const issueTypeGroup = sourceFlow.locator('[data-mapping-group="source:issue_type"]');
  await expect(issueTypeGroup.getByRole("button", { name: /Issue type.*2 values.*5 issues/ })).toBeVisible();
  await issueTypeGroup.getByRole("button", { name: /Issue type/ }).click();
  await expect(issueTypeGroup.locator("[data-mapping]:visible")).toHaveCount(0);
  await issueTypeGroup.getByRole("button", { name: /Issue type/ }).click();
  await expect(issueTypeGroup.locator("[data-mapping]:visible")).toHaveCount(2);
  const bug = page.locator('[data-mapping="source:issue_type:bug"]');
  await expect(bug.getByRole("button", { name: "Save" })).toBeDisabled();
  await bug.getByRole("combobox").selectOption("bug");
  await expect(bug.getByRole("button", { name: "Save" })).toBeEnabled();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(issueTypeGroup.getByRole("button", { name: /Issue type/ })).toBeVisible();
  await expect(bug.getByRole("combobox")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("issue-editor: canonical surface and blocked Jira dry-run", async ({ page }) => {
  const longSource = `## Source detail\n\n${Array.from({ length: 14 }, (_, index) => `Source paragraph ${index + 1}: evidence remains available when the panel expands.`).join("\n\n")}`;
  const editor = { issue: { id: "issue-1", project_id: 1, sync_status: "pending_mapping", current_revision: 2 }, canonical: { summary: { value: "Canonical", source: "manual" }, description: { value: "## Details\n\nBody\n\n<script>alert('x')</script>", source: "manual" } }, sources: { summary: { cis: "Canonical", backlog: "Source summary", jira: "Target summary" }, description: { cis: "## CIS detail\n\nCanonical evidence", backlog: longSource, jira: "## Jira detail\n\nTarget evidence" }, priority: { cis: "Medium", backlog: "Normal", jira: "Medium" }, status: { cis: "In Review", backlog: "Resolved", jira: "In Review" } }, field_meta: { catalogs: {} }, translations: [{ id: 7, target_field: "description", source_text: "## Source\n\n**Original**", ai_draft: "## Draft\n\n**Translated**", review_status: "ai_draft" }], translation: { total: 1 }, sync: { canonical_hash: "1234567890abcdef" } };
  await page.route("**/api/v1/issues/issue-1/editor", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: editor }) }));
  await page.route("**/api/v1/issues/issue-1/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.route("**/api/v1/issues/issue-1/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  await page.route("**/api/v1/issues/issue-1/dry-run/jira", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { can_sync: false, payload: { fields: { summary: "Canonical" } }, validation: { errors: [{ code: "MAPPING_REQUIRED", message: "Required mapping is missing." }] }, warnings: [] } }) }));
  await enter(page, "/cis-issues/issue-1");
  await expect(page.getByRole("heading", { name: "Issue Editor" })).toBeVisible();
  await expect(page.locator("#canonical-summary").locator("..")).toHaveClass(/col-12/);
  const description = page.locator("#canonical-description");
  const canonicalEditor = page.locator("[data-markdown-editor]").filter({ has: description });
  await description.evaluate((element) => {
    const start = element.value.indexOf("Body");
    element.setSelectionRange(start, start + "Body\n\n".length);
  });
  await canonicalEditor.getByRole("button", { name: "Bold" }).click();
  await expect(description).toHaveValue("## Details\n\n**Body**\n\n<script>alert('x')</script>");
  await canonicalEditor.getByRole("tab", { name: "Preview" }).click();
  const preview = canonicalEditor.locator('[data-md-panel="preview"]');
  await expect(preview.getByRole("heading", { name: "Details" })).toBeVisible();
  await expect(preview.getByText("Body", { exact: true })).toBeVisible();
  await expect(preview.locator("script")).toHaveCount(0);
  const snapshots = page.locator("[data-source-snapshots]");
  await expect(snapshots).toHaveCount(1);
  expect(await snapshots.evaluate((element) => element.parentElement.lastElementChild === element)).toBe(true);
  const [mainBox, railBox] = await Promise.all([page.locator(".issue-editor-main").boundingBox(), page.locator(".issue-editor-rail").boundingBox()]);
  expect(railBox.x).toBeGreaterThan(mainBox.x + mainBox.width);
  await expect(snapshots.locator('[data-snapshot-field="description"]')).toHaveClass(/snapshot-field--wide/);
  await expect(snapshots.locator('[data-snapshot-field="priority"]')).toBeVisible();
  const sourceDetail = snapshots.locator('[data-snapshot-field="description"]');
  await expect(sourceDetail.getByRole("heading", { name: "Source detail" })).toBeVisible();
  const showMore = sourceDetail.locator(".snapshot-system").filter({ hasText: "BACKLOG" }).locator("[data-snapshot-toggle]");
  await expect(showMore).toBeVisible();
  await showMore.click();
  await expect(showMore).toHaveAttribute("aria-expanded", "true");
  await expect(showMore).toHaveText("Show less");
  const translation = page.locator('[data-translation="7"]');
  const sourcePreview = translation.locator("[data-md-readonly]");
  await expect(sourcePreview.getByRole("heading", { name: "Source" })).toBeVisible();
  await expect(sourcePreview.getByText("Original", { exact: true })).toBeVisible();
  await expect(sourcePreview).not.toContainText("## Source");
  const reviewed = translation.locator(".translation-workbench");
  await expect(reviewed.getByRole("textbox", { name: "AI draft" })).toHaveValue("## Draft\n\n**Translated**");
  await expect(translation.getByRole("button", { name: "Save draft" })).toBeVisible();
  await expect(translation.getByRole("button", { name: "Approve", exact: true })).toBeVisible();
  await reviewed.getByRole("tab", { name: "Preview" }).click();
  await expect(reviewed.getByRole("heading", { name: "Draft" })).toBeVisible();
  const heights = await Promise.all([translation.locator(".translation-source").evaluate((element) => element.getBoundingClientRect().height), reviewed.evaluate((element) => element.getBoundingClientRect().height)]);
  expect(Math.abs(heights[0] - heights[1])).toBeLessThan(2);
  await page.getByRole("button", { name: "Prepare Jira sync" }).click();
  const dialog = page.getByRole("dialog", { name: "Jira sync preparation" });
  await expect(dialog).toContainText("Required mapping is missing.");
  await expect(dialog.getByRole("button", { name: "Sync Jira" })).toBeDisabled();
  await dialog.locator("[data-dialog-close]").last().click();
  await page.setViewportSize({ width: 500, height: 900 });
  const [mobileMain, mobileRail] = await Promise.all([page.locator(".issue-editor-main").boundingBox(), page.locator(".issue-editor-rail").boundingBox()]);
  expect(mobileMain.y).toBeGreaterThan(mobileRail.y + mobileRail.height);
});

test("Jira gate publishes operator-reviewed fields after a successful dry-run", async ({ page }) => {
  const editor = { issue: { id: "issue-2", project_id: 1, sync_status: "ready", current_revision: 1 }, canonical: { summary: { value: "Canonical", source: "manual" } }, sources: {}, field_meta: { catalogs: {} }, translations: [], translation: { total: 0 }, sync: { canonical_hash: "abcdef1234567890" } };
  await page.route("**/api/v1/issues/issue-2/editor", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: editor }) }));
  await page.route("**/api/v1/issues/issue-2/attachments", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.route("**/api/v1/issues/issue-2/history", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { manual_edits: [] } }) }));
  await page.route("**/api/v1/issues/issue-2/dry-run/jira", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { can_sync: true, payload: { fields: { summary: "Canonical", description: "Prepared", issuetype: { name: "Task" }, priority: { name: "High" }, duedate: "2026-07-31" }, transition_preview: { status: "To Do" } }, validation: { errors: [] }, warnings: [] } }) }));
  let published;
  await page.route("**/api/v1/issues/issue-2/sync/jira", async (route) => {
    published = route.request().postDataJSON();
    await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ data: { id: "jira-job-2", status: "pending" } }) });
  });
  await page.route("**/api/v1/sync-jobs/jira-job-2", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: "jira-job-2", status: "success" } }) }));
  await enter(page, "/cis-issues/issue-2");
  await page.getByRole("button", { name: "Prepare Jira sync" }).click();
  const dialog = page.getByRole("dialog", { name: "Jira sync preparation" });
  await dialog.getByLabel("Summary").fill("Operator-approved summary");
  await dialog.getByRole("button", { name: "Sync Jira" }).click();
  await expect.poll(() => published).toEqual({ jira_fields: { summary: "Operator-approved summary", description: "Prepared", issue_type: "Task", priority: "High", status: "To Do", assignee: "", due_date: "2026-07-31" } });
  await expect(dialog.getByText("Job jira-job-2: success")).toBeVisible();
});

test("translation queue and glossary expose human review controls", async ({ page }) => {
  const queueItem = { id: 7, issue_id: "issue-1", source_system: "backlog", system_issue_key: "ONE_KYORITSU-2292", target_field: "summary", source_text: "## Source heading\nOriginal text", ai_draft: "**Draft translation**", review_status: "ai_draft", provider: "deepseek", model_or_command: "deepseek-v4-flash" };
  let savedDraft;
  await page.route("**/api/v1/translation-queue**", async (route) => {
    if (route.request().method() === "PUT") {
      savedDraft = route.request().postDataJSON();
      queueItem.ai_draft = savedDraft.draft_text;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: queueItem }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [queueItem] }) });
  });
  await enter(page, "/translation-queue?project_id=1");
  await expect(page.getByRole("heading", { name: "Translation Queue" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Source", exact: true })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Draft", exact: true })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Reviewed", exact: true })).toHaveCount(0);
  await expect(page.getByText("[BACKLOG]", { exact: true })).toBeVisible();
  await expect(page.getByText("ONE_KYORITSU-2292", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  const reviewDialog = page.getByRole("dialog", { name: "Edit translation draft" });
  await expect(reviewDialog.getByRole("heading", { name: "Source", exact: true })).toBeVisible();
  await expect(reviewDialog.getByRole("heading", { name: "Source heading" })).toBeVisible();
  const draftEditor = reviewDialog.getByRole("textbox", { name: "AI draft" });
  await expect(draftEditor).toHaveValue("**Draft translation**");
  await draftEditor.fill("**Operator draft**");
  await reviewDialog.getByRole("button", { name: "Save draft" }).click();
  await expect.poll(() => savedDraft).toEqual({ draft_text: "**Operator draft**", review_notes: "translation-queue" });
  await page.route("**/api/v1/projects/1/translation-glossary", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { concepts: [{ id: 1, group_key: "default", concept_key: "staging", note: "Environment", terms: [{ language_code: "ja", term: "ステージング", is_canonical: true }, { language_code: "vi", term: "STG", is_canonical: true }] }] } }) }));
  await page.getByRole("link", { name: "Translation Glossary" }).click();
  await expect(page).toHaveURL(/\/translation-glossary$/);
  await expect(page.getByRole("button", { name: "Add concept" })).toBeVisible();
  await expect(page.getByText("ステージング ★")).toBeVisible();
});
