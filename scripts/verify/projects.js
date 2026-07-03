const assert = require("assert");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function assertProjectSecretsAreNotStored(config, projectId) {
  const db = createConnection({ config });
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
  db.close();

  assert.equal(project.backlog_api_key_env, "BACKLOG_API_KEY");
  assert.equal(project.jira_email_env, "JIRA_EMAIL");
  assert.equal(project.jira_api_token_env, "JIRA_API_TOKEN");
  assert.equal(Object.prototype.hasOwnProperty.call(project, "backlog_api_key"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(project, "jira_api_token"), false);
}

async function main() {
  const config = makeTempConfig("projects", {
    ADMIN_EMAIL: "admin@example.test",
    ADMIN_PASSWORD: "correct-horse-battery",
  });

  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({
    config,
    email: "admin@example.test",
    password: "correct-horse-battery",
  });

  const app = createApp({ config });
  await withServer(app, async (server) => {
    const unauthorized = await requestJson(server, { pathname: "/api/v1/projects" });
    assert.equal(unauthorized.status, 401);
    assert.equal(unauthorized.body.error.code, "UNAUTHENTICATED");

    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: {
        email: "admin@example.test",
        password: "correct-horse-battery",
      },
    });
    const token = login.body.data.token;

    const defaultTranslationProject = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Default Translation Provider",
      },
    });
    assert.equal(defaultTranslationProject.status, 201);
    assert.equal(defaultTranslationProject.body.data.translation_ai_provider, "deepseek");
    assert.equal(defaultTranslationProject.body.data.translation_ai_transport, "openai_compatible");
    assert.equal(defaultTranslationProject.body.data.translation_ai_model, "deepseek-v4-flash");

    const created = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Projects Verify",
        backlog_space_url: "https://example.backlog.com",
        backlog_space_key: "EXAMPLE",
        backlog_project_key: "WEC",
        backlog_issue_key_prefix: "WEC",
        backlog_api_key_env: "BACKLOG_API_KEY",
        jira_site_url: "https://example.atlassian.net",
        jira_project_key: "SYNC",
        jira_email_env: "JIRA_EMAIL",
        jira_api_token_env: "JIRA_API_TOKEN",
        translation_ai_provider: "codex_exec",
        translation_glossary_json: [
          { source: "予約", target: "đặt chỗ" },
          { source: "管理画面", target: "màn hình quản trị" },
        ],
        manual_pull_enabled: true,
        scheduled_pull_enabled: true,
        scheduled_pull_interval_minutes: 10,
        pull_updated_since_window_minutes: 45,
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.translation_ai_provider, "codex_exec");
    assert.equal(created.body.data.translation_ai_transport, "process_exec");
    assert.equal(created.body.data.translation_ai_model, null);
    assert.deepEqual(created.body.data.translation_glossary_json, [
      { source: "予約", target: "đặt chỗ" },
      { source: "管理画面", target: "màn hình quản trị" },
    ]);
    assert.equal(created.body.data.manual_pull_enabled, true);
    assert.equal(created.body.data.scheduled_pull_enabled, true);
    assert.equal(created.body.data.scheduled_pull_interval_minutes, 10);
    assert.equal(created.body.data.pull_updated_since_window_minutes, 45);
    assert.deepEqual(created.body.data.scheduled_pull_filter_json, {
      statuses: [],
      issue_types: [],
      priorities: [],
      include_closed: true,
      include_attachments: "metadata_only",
      page_size: 100,
    });

    const invalidTransport = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Invalid Translation AI Transport",
        translation_ai_provider: "deepseek",
        translation_ai_transport: "process_exec",
        translation_ai_model: "deepseek-v4-flash",
      },
    });
    assert.equal(invalidTransport.status, 422);
    assert.equal(invalidTransport.body.error.code, "VALIDATION_ERROR");

    const projectId = created.body.data.id;
    assertProjectSecretsAreNotStored(config, projectId);

    const enabled = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${projectId}/sync/enable`,
      token,
    });
    assert.equal(enabled.status, 200);
    assert.equal(enabled.body.data.sync_enabled, true);

    const disabled = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${projectId}/sync/disable`,
      token,
    });
    assert.equal(disabled.status, 200);
    assert.equal(disabled.body.data.sync_enabled, false);

    const fetched = await requestJson(server, {
      pathname: `/api/v1/projects/${projectId}`,
      token,
    });
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.data.id, projectId);
    assert.equal(fetched.body.data.sync_enabled, false);

    const rejectedSecret = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Bad Secret Project",
        backlog_api_key: "real-secret-value",
      },
    });
    assert.equal(rejectedSecret.status, 422);
    assert.equal(rejectedSecret.body.error.code, "SECRET_FIELD_NOT_ALLOWED");

    const rejectedEnvName = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Bad Env Project",
        jira_api_token_env: "secret-token-shape",
      },
    });
    assert.equal(rejectedEnvName.status, 422);
    assert.equal(rejectedEnvName.body.error.code, "INVALID_ENV_NAME");
  });

  console.log("Projects verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
