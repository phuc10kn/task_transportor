import { expect, test } from "@playwright/test";

test("project config lists and persists active fields", async ({ page }) => {
  let serverProject = { id: 1, name: "Demo", backlog_project_key: "BLG", jira_project_key: "JIRA", source_language: "ja", target_language: "vi", translation_ai_provider: "deepseek", translation_ai_transport: "openai_compatible", translation_ai_model: "deepseek-v4-flash", enabled: true };
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "project-token", admin: { id: 1, email: "admin@example.com" } } }) }));
  await page.route("**/api/v1/projects", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [serverProject, { id: 2, name: "Second", backlog_project_key: "BLG2", jira_project_key: "JIRA2", source_language: "ja", target_language: "vi", enabled: true }] }) });
    return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ data: { id: 2, name: "Created", source_language: "ja", target_language: "vi" } }) });
  });
  await page.route("**/api/v1/projects/1", async (route) => {
    expect(JSON.parse(route.request().postData() || "{}")).toMatchObject({
      name: "Demo Updated",
      source_language: "ja",
      target_language: "vi",
      translation_ai_provider: "deepseek",
      translation_ai_transport: "openai_compatible",
      translation_ai_model: "deepseek-v4-flash",
      enabled: true,
    });
    serverProject = { ...serverProject, name: "Demo Updated" };
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: serverProject }) });
  });
  await page.goto("/login?next=%2Fprojects%3Fproject_id%3D1");
  await page.getByLabel("Email").fill("admin@example.com"); await page.getByLabel("Password").fill("12345678"); await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/projects\?project_id=1$/); await expect(page.getByRole("heading", { name: "Project Config", exact: true })).toBeVisible(); await expect(page.locator('input').first()).toHaveValue("Demo"); await expect(page.getByRole("button", { name: "Open Demo" })).toContainText("BLG"); await expect(page.getByRole("button", { name: "Open Demo" })).toContainText("JIRA");
  await expect(page.getByRole("heading", { name: "General configuration" })).toBeVisible();
  const backlogSystem = page.locator('details[aria-label="Backlog connection"]');
  const jiraSystem = page.locator('details[aria-label="Jira connection"]');
  await expect(backlogSystem).toHaveAttribute("open", ""); await expect(jiraSystem).toHaveAttribute("open", "");
  await backlogSystem.locator("summary").focus(); await backlogSystem.locator("summary").press("Enter");
  await expect(backlogSystem).not.toHaveAttribute("open", ""); await expect(page.getByLabel("Backlog URL")).not.toBeVisible();
  await backlogSystem.locator("summary").press("Enter"); await expect(backlogSystem).toHaveAttribute("open", ""); await expect(page.getByLabel("Backlog URL")).toBeVisible();
  await expect(page.locator(".project-list-item").nth(1)).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".policy-choice").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".policy-choice input").first()).toHaveCSS("accent-color", "rgb(37, 99, 235)");
  await expect(page.locator(".selected-surface")).toHaveCSS("background-color", "rgb(239, 246, 255)");
  await page.locator('input').first().fill("Demo Updated"); await page.getByRole("button", { name: "Save project" }).click(); await expect(page.locator('input').first()).toHaveValue("Demo Updated");
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/login?next=%2Fprojects%3Fproject_id%3D1"); await page.getByLabel("Email").fill("admin@example.com"); await page.getByLabel("Password").fill("12345678"); await page.getByRole("button", { name: "Sign in" }).click(); await expect(page.getByRole("heading", { name: "Project configuration" })).toBeVisible(); await expect(page.getByLabel("Name")).toHaveValue("Demo Updated");
});

test("project selection uses URL and retry recovers loading error", async ({ page }) => {
  let getCount = 0;
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "project-token", admin: { id: 1, email: "admin@example.com" } } }) }));
  await page.route("**/api/v1/projects", (route) => {
    if (route.request().method() !== "GET") return route.continue();
    getCount += 1;
    return getCount === 1
      ? route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAVAILABLE", message: "Projects unavailable." } }) })
      : route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 1, name: "Demo", source_language: "ja", target_language: "vi" }, { id: 2, name: "Second", source_language: "ja", target_language: "vi" }] }) });
  });
  await page.goto("/login?next=%2Fprojects%3Fproject_id%3D2");
  await page.getByLabel("Email").fill("admin@example.com"); await page.getByLabel("Password").fill("12345678"); await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Projects unavailable.")).toBeVisible(); await page.getByRole("button", { name: "Retry" }).click();
  await expect(page).toHaveURL(/\/projects\?project_id=2$/); await expect(page.getByLabel("Name")).toHaveValue("Second");
});

test("project empty state is explicit", async ({ page }) => {
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "project-token", admin: { id: 1, email: "admin@example.com" } } }) }));
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }));
  await page.goto("/login?next=%2Fprojects");
  await page.getByLabel("Email").fill("admin@example.com"); await page.getByLabel("Password").fill("12345678"); await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("No projects configured.")).toBeVisible();
});

test("project validation error keeps input and focuses the invalid field", async ({ page }) => {
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "project-token", admin: { id: 1, email: "admin@example.com" } } }) }));
  await page.route("**/api/v1/projects", (route) => route.request().method() === "GET"
    ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 1, name: "Demo", source_language: "ja", target_language: "vi" }] }) })
    : route.continue());
  await page.route("**/api/v1/projects/1", (route) => route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: { code: "VALIDATION_ERROR", message: "Project name is required.", details: { field: "name" } } }) }));
  await page.goto("/login?next=%2Fprojects%3Fproject_id%3D1");
  await page.getByLabel("Email").fill("admin@example.com"); await page.getByLabel("Password").fill("12345678"); await page.getByRole("button", { name: "Sign in" }).click();
  const name = page.getByLabel("Name"); await name.fill("Still here"); await page.getByRole("button", { name: "Save project" }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText("Project name is required."); await expect(name).toHaveValue("Still here"); await expect(name).toBeFocused();
});

test("provider controls only expose valid transport and model combinations", async ({ page }) => {
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { token: "project-token", admin: { id: 1, email: "admin@example.com" } } }) }));
  await page.route("**/api/v1/projects", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ id: 1, name: "Demo", source_language: "ja", target_language: "vi" }] }) }));
  await page.goto("/login?next=%2Fprojects%3Fproject_id%3D1");
  await page.getByLabel("Email").fill("admin@example.com"); await page.getByLabel("Password").fill("12345678"); await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByLabel("Provider").selectOption("codex_exec");
  await expect(page.getByLabel("Transport")).toHaveValue("process_exec"); await expect(page.getByLabel("Model")).toBeDisabled(); await expect(page.getByRole("status")).toHaveText(/no model is sent/i);
  await page.getByLabel("Provider").selectOption("deepseek"); await page.getByLabel("Model").selectOption("deepseek-chat"); await expect(page.getByRole("status")).toHaveText(/deprecated soon/i);
});
