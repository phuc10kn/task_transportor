const assert = require("assert");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig, makeTempEnv } = require("./helpers/tempConfig");
const { loadConfig } = require("../../src/config/env");
const { translationAiModelsFor } = require("../../src/shared/translationModels");
const {
  syncProjectCredentialsFromEnv,
} = require("../../src/infrastructure/database/syncProjectCredentialsFromEnv");

function assertProjectCredentialsAreStored(config, projectId) {
  const db = createConnection({ config });
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
  db.close();

  assert.equal(project.backlog_api_key, "backlog-secret-key");
  assert.equal(project.jira_email, "sync-admin@example.test");
  assert.equal(project.jira_api_token, "jira-secret-token");
  assert.equal(project.backlog_api_key_env, null);
  assert.equal(project.jira_email_env, null);
  assert.equal(project.jira_api_token_env, null);
}

function verifyLegacyEnvCredentialMigration() {
  const env = makeTempEnv("projects-credential-migration", {
    LEGACY_BACKLOG_API_KEY: "legacy-backlog-api-key-value",
    LEGACY_JIRA_EMAIL: "legacy-jira-user@example.test",
    LEGACY_JIRA_API_TOKEN: "legacy-jira-api-token-value",
  });
  const config = loadConfig(env);

  ensureStorage(config.storage);
  migrate({ config, env });
  const legacyOwner = AuthApi.bootstrapSystemAdmin({
    config,
    email: "legacy-owner@example.test",
    password: "verify-password",
  }).user;

  const db = createConnection({ config });
  try {
    const teamId = db.prepare("INSERT INTO teams (name) VALUES (?)").run("Legacy Env Credential Team").lastInsertRowid;
    db.prepare("INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'lead')").run(teamId, legacyOwner.id);
    db
      .prepare(
        `INSERT INTO projects (
          name,
          backlog_api_key_env,
          jira_email_env,
          jira_api_token_env,
          scheduled_pull_filter_json,
          team_id,
          owner_user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        "Legacy Env Credential Project",
        "LEGACY_BACKLOG_API_KEY",
        "LEGACY_JIRA_EMAIL",
        "LEGACY_JIRA_API_TOKEN",
        JSON.stringify({}),
        teamId,
        legacyOwner.id
      );

    const result = syncProjectCredentialsFromEnv({ db, env });
    assert.equal(result.scanned_projects, 1);
    assert.equal(result.updated_projects, 1);
    assert.equal(result.updated_fields, 3);
  } finally {
    db.close();
  }

  const verifyDb = createConnection({ config });
  try {
    const project = verifyDb
      .prepare("SELECT * FROM projects WHERE name = ?")
      .get("Legacy Env Credential Project");

    assert.equal(project.backlog_api_key, "legacy-backlog-api-key-value");
    assert.equal(project.jira_email, "legacy-jira-user@example.test");
    assert.equal(project.jira_api_token, "legacy-jira-api-token-value");
    assert.equal(project.backlog_api_key_env, "LEGACY_BACKLOG_API_KEY");
    assert.equal(project.jira_email_env, "LEGACY_JIRA_EMAIL");
    assert.equal(project.jira_api_token_env, "LEGACY_JIRA_API_TOKEN");
  } finally {
    verifyDb.close();
  }
}

async function main() {
  verifyLegacyEnvCredentialMigration();

  const config = makeTempConfig("projects", {
    ADMIN_EMAIL: "admin@example.test",
    ADMIN_PASSWORD: "correct-horse-battery",
  });

  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapSystemAdmin({
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

    const memberCreated = await requestJson(server, {
      method: "POST", pathname: "/api/v1/users", token,
      body: { email: "member@example.test", password: "member-password", name: "Team Member", system_role: "user" },
    });
    assert.equal(memberCreated.status, 201);
    const outsiderAdminCreated = await requestJson(server, {
      method: "POST", pathname: "/api/v1/users", token,
      body: { email: "outsider-admin@example.test", password: "outsider-password", system_role: "system_admin" },
    });
    assert.equal(outsiderAdminCreated.status, 201);

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

    const openAiProject = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "OpenAI Translation Provider",
        translation_ai_provider: "openai",
        translation_ai_transport: "openai_compatible",
        translation_ai_model: "gpt-4.1-mini",
      },
    });
    assert.equal(openAiProject.status, 201);
    assert.equal(openAiProject.body.data.translation_ai_provider, "openai");
    assert.equal(openAiProject.body.data.translation_ai_transport, "openai_compatible");
    assert.equal(openAiProject.body.data.translation_ai_model, "gpt-4.1-mini");
    assert.deepEqual(
      translationAiModelsFor("openai", "openai_compatible").map((model) => model.value),
      ["gpt-4.1-mini", "gpt-5.4-mini", "gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"]
    );

    const openAiTerraProject = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "OpenAI Terra Translation Provider",
        translation_ai_provider: "openai",
        translation_ai_transport: "openai_compatible",
        translation_ai_model: "gpt-5.6-terra",
      },
    });
    assert.equal(openAiTerraProject.status, 201);
    assert.equal(openAiTerraProject.body.data.translation_ai_model, "gpt-5.6-terra");

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
        backlog_api_key: "backlog-secret-key",
        jira_site_url: "https://example.atlassian.net",
        jira_project_key: "SYNC",
        jira_email: "sync-admin@example.test",
        jira_api_token: "jira-secret-token",
        translation_ai_provider: "deepseek",
        manual_pull_enabled: true,
        scheduled_pull_enabled: true,
        scheduled_pull_interval_minutes: 10,
        pull_updated_since_window_minutes: 45,
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.translation_ai_provider, "deepseek");
    assert.equal(created.body.data.translation_ai_transport, "openai_compatible");
    assert.equal(created.body.data.translation_ai_model, "deepseek-v4-flash");
    assert.equal(Object.prototype.hasOwnProperty.call(created.body.data, "translation_glossary_json"), false);
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

    const legacyGlossary = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Legacy Glossary Rejected",
        translation_glossary_json: [{ source: "予約", target: "đặt chỗ" }],
      },
    });
    assert.equal(legacyGlossary.status, 422);
    assert.equal(legacyGlossary.body.error.code, "VALIDATION_ERROR");
    assert.equal(legacyGlossary.body.error.details.field, "translation_glossary_json");

    const invalidTransport = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Invalid Translation AI Transport",
        translation_ai_provider: "deepseek",
        translation_ai_transport: "unsupported_transport",
        translation_ai_model: "deepseek-v4-flash",
      },
    });
    assert.equal(invalidTransport.status, 422);
    assert.equal(invalidTransport.body.error.code, "VALIDATION_ERROR");

    const invalidOpenAiTransport = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Invalid OpenAI Transport",
        translation_ai_provider: "openai",
        translation_ai_transport: "anthropic_compatible",
        translation_ai_model: "gpt-4.1-mini",
      },
    });
    assert.equal(invalidOpenAiTransport.status, 422);
    assert.equal(invalidOpenAiTransport.body.error.code, "VALIDATION_ERROR");

    const projectId = created.body.data.id;
    assertProjectCredentialsAreStored(config, projectId);

    const memberLogin = await requestJson(server, { method: "POST", pathname: "/api/v1/auth/login", body: { email: "member@example.test", password: "member-password" } });
    const memberToken = memberLogin.body.data.token;
    const hiddenBeforeMembership = await requestJson(server, { pathname: `/api/v1/projects/${projectId}`, token: memberToken });
    assert.equal(hiddenBeforeMembership.status, 404);

    const outsiderLogin = await requestJson(server, { method: "POST", pathname: "/api/v1/auth/login", body: { email: "outsider-admin@example.test", password: "outsider-password" } });
    const outsiderToken = outsiderLogin.body.data.token;
    const outsiderProjects = await requestJson(server, { pathname: "/api/v1/projects", token: outsiderLogin.body.data.token });
    assert.deepEqual(outsiderProjects.body.data, []);

    const ownershipProject = await requestJson(server, {
      method: "POST", pathname: "/api/v1/projects", token,
      body: { name: "Ownership Transfer Project" },
    });
    assert.equal(ownershipProject.status, 201);
    const ownershipProjectId = ownershipProject.body.data.id;

    const memberCannotListOwnerships = await requestJson(server, { pathname: "/api/v1/projects/ownerships", token: memberToken });
    assert.equal(memberCannotListOwnerships.status, 403);

    const ownerships = await requestJson(server, { pathname: "/api/v1/projects/ownerships", token: outsiderToken });
    assert.equal(ownerships.status, 200);
    assert.equal(ownerships.body.data.find((item) => item.project_id === ownershipProjectId).owner.email, "admin@example.test");

    const memberCannotTransferOwner = await requestJson(server, {
      method: "PATCH", pathname: `/api/v1/projects/${ownershipProjectId}/owner`, token: memberToken,
      body: { new_owner_user_id: memberCreated.body.data.id },
    });
    assert.equal(memberCannotTransferOwner.status, 403);

    const missingNewOwner = await requestJson(server, {
      method: "PATCH", pathname: `/api/v1/projects/${ownershipProjectId}/owner`, token: outsiderToken,
      body: { new_owner_user_id: 999999 },
    });
    assert.equal(missingNewOwner.status, 404);
    assert.equal(missingNewOwner.body.error.code, "USER_NOT_FOUND");

    const transferred = await requestJson(server, {
      method: "PATCH", pathname: `/api/v1/projects/${ownershipProjectId}/owner`, token: outsiderToken,
      body: { new_owner_user_id: memberCreated.body.data.id },
    });
    assert.equal(transferred.status, 200);
    assert.equal(transferred.body.data.owner_user_id, memberCreated.body.data.id);
    assert.equal(transferred.body.data.owner.email, "member@example.test");

    const newOwnerProject = await requestJson(server, { pathname: `/api/v1/projects/${ownershipProjectId}`, token: memberToken });
    assert.equal(newOwnerProject.status, 200);
    assert.equal(newOwnerProject.body.data.access.is_owner, true);
    assert.equal(newOwnerProject.body.data.access.team_role, "lead");

    const previousOwnerProject = await requestJson(server, { pathname: `/api/v1/projects/${ownershipProjectId}`, token });
    assert.equal(previousOwnerProject.status, 200);
    assert.equal(previousOwnerProject.body.data.access.is_owner, false);
    assert.equal(previousOwnerProject.body.data.access.team_role, "member");

    const outsiderStillCannotReadProject = await requestJson(server, { pathname: `/api/v1/projects/${ownershipProjectId}`, token: outsiderToken });
    assert.equal(outsiderStillCannotReadProject.status, 404);
    const outsiderStillHasNoWorkspace = await requestJson(server, { pathname: "/api/v1/projects", token: outsiderToken });
    assert.deepEqual(outsiderStillHasNoWorkspace.body.data, []);

    const transferredTeam = await requestJson(server, { pathname: `/api/v1/projects/${ownershipProjectId}/team`, token: memberToken });
    const newOwnerMembership = transferredTeam.body.data.members.find((item) => item.id === memberCreated.body.data.id);
    const previousOwnerMembership = transferredTeam.body.data.members.find((item) => item.email === "admin@example.test");
    assert.equal(newOwnerMembership.role, "lead");
    assert.equal(newOwnerMembership.is_owner, true);
    assert.equal(previousOwnerMembership.role, "member");
    assert.equal(previousOwnerMembership.is_owner, false);

    const addedMember = await requestJson(server, {
      method: "POST", pathname: `/api/v1/projects/${projectId}/team/members`, token,
      body: { email: "member@example.test", role: "member" },
    });
    assert.equal(addedMember.status, 201);
    const memberProjects = await requestJson(server, { pathname: "/api/v1/projects", token: memberToken });
    assert.equal(memberProjects.body.data.length, 2);
    assert.equal(memberProjects.body.data.find((item) => item.id === projectId).access.team_role, "member");
    const memberCannotConfigure = await requestJson(server, { method: "PATCH", pathname: `/api/v1/projects/${projectId}`, token: memberToken, body: { name: "Forbidden rename" } });
    assert.equal(memberCannotConfigure.status, 403);

    const ownerTeam = await requestJson(server, { pathname: `/api/v1/projects/${projectId}/team`, token });
    const ownerMember = ownerTeam.body.data.members.find((item) => item.is_owner);
    const ownerRemoval = await requestJson(server, { method: "DELETE", pathname: `/api/v1/projects/${projectId}/team/members/${ownerMember.id}`, token });
    assert.equal(ownerRemoval.status, 409);

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

    const allowedCredentials = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "DB Credential Project",
        backlog_api_key: "real-secret-value",
        jira_email: "db-user@example.test",
        jira_api_token: "real-jira-token",
      },
    });
    assert.equal(allowedCredentials.status, 201);
    assert.equal(allowedCredentials.body.data.backlog_api_key, "real-secret-value");
    assert.equal(allowedCredentials.body.data.jira_email, "db-user@example.test");
    assert.equal(allowedCredentials.body.data.jira_api_token, "real-jira-token");

    const aliasCredentials = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Legacy Alias Credential Project",
        backlog_api_key_env: "legacy-backlog-secret",
        jira_email_env: "legacy-user@example.test",
        jira_api_token_env: "secret-token-shape",
      },
    });
    assert.equal(aliasCredentials.status, 201);
    assert.equal(aliasCredentials.body.data.backlog_api_key, "legacy-backlog-secret");
    assert.equal(aliasCredentials.body.data.jira_email, "legacy-user@example.test");
    assert.equal(aliasCredentials.body.data.jira_api_token, "secret-token-shape");
    assert.equal(aliasCredentials.body.data.backlog_api_key_env, null);
    assert.equal(aliasCredentials.body.data.jira_email_env, null);
    assert.equal(aliasCredentials.body.data.jira_api_token_env, null);
    const disposableTeamId = aliasCredentials.body.data.team_id;
    const deletedProject = await requestJson(server, {
      method: "DELETE", pathname: `/api/v1/projects/${aliasCredentials.body.data.id}`, token,
    });
    assert.equal(deletedProject.status, 200);
    const lifecycleDb = createConnection({ config });
    assert.equal(lifecycleDb.prepare("SELECT COUNT(*) AS total FROM teams WHERE id = ?").get(disposableTeamId).total, 0);
    assert.equal(lifecycleDb.prepare("SELECT COUNT(*) AS total FROM team_members WHERE team_id = ?").get(disposableTeamId).total, 0);
    lifecycleDb.close();
  });

  console.log("Projects verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
