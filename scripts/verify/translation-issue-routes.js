const assert = require("assert");
const path = require("path");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const { ISSUE_STATUSES } = require("../../src/shared/stateConstants");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function fakeCommand() {
  return `"${process.execPath}" "${path.join(__dirname, "fakes", "codex-exec.js")}"`;
}

function setupConfig() {
  const config = makeTempConfig("translation-issue-routes", {
    ADMIN_EMAIL: "translation-routes@example.test",
    ADMIN_PASSWORD: "verify-password",
    CODEX_EXEC_COMMAND: fakeCommand(),
  });

  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({
    config,
    email: "translation-routes@example.test",
    password: "verify-password",
  });

  return config;
}

function createProject(config) {
  return ProjectsApi.createProject({
    config,
    input: {
      name: "Translation Routes Verify",
      enabled: true,
      sync_enabled: true,
      backlog_project_key: "TR",
      backlog_issue_key_prefix: "TR",
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_project_key: "TRD",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_TOKEN",
      translation_provider: "codex_exec",
    },
  });
}

function createUntranslatedIssue(config, project, backlogIssueKey = "TR-1") {
  return CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: backlogIssueKey,
      jira_issue_key: backlogIssueKey.replace(/^TR/, "TRD"),
      source_system: "backlog",
      status: ISSUE_STATUSES.APPROVED,
      fields_json: {
        summary: { backlog: "Backlog summary for translate" },
        description: { backlog: "Backlog description for translate" },
      },
    },
  });
}

function readIssue(config, issueId) {
  const db = createConnection({ config });
  try {
    const row = db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
    return {
      ...row,
      fields_json: JSON.parse(row.fields_json || "{}"),
    };
  } finally {
    db.close();
  }
}

async function login(server) {
  const response = await requestJson(server, {
    method: "POST",
    pathname: "/api/v1/auth/login",
    body: {
      email: "translation-routes@example.test",
      password: "verify-password",
    },
  });

  assert.equal(response.status, 200);
  return response.body.data.token;
}

async function main() {
  const config = setupConfig();
  const project = createProject(config);
  const issue = createUntranslatedIssue(config, project);
  const compatIssue = createUntranslatedIssue(config, project, "TR-2");
  const app = createApp({ config });

  await withServer(app, async (server) => {
    const token = await login(server);

    // Happy case 1: Project-scoped issue route — translate all issue targets
    const canonicalTranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/translations/translate`,
      token,
    });
    assert.equal(canonicalTranslate.status, 200, "canonical translate status");
    assert.equal(canonicalTranslate.body.data.translated_items.length, 2);
    assert.equal(canonicalTranslate.body.data.translations.length, 2);
    assert.deepEqual(
      canonicalTranslate.body.data.translations.map((item) => item.target_field).sort(),
      ["description", "summary"]
    );
    assert.ok(canonicalTranslate.body.data.translations.every((item) => item.review_status === "ai_draft"));
    assert.ok(canonicalTranslate.body.data.translations.every((item) => item.ai_draft.includes("[vi] ")));

    const summaryItem = canonicalTranslate.body.data.translations.find((item) => item.target_field === "summary");

    // Happy case 2: Project-scoped issue route — retranslate one queue item
    const canonicalRetranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/translations/${summaryItem.id}/translate`,
      token,
    });
    assert.equal(canonicalRetranslate.status, 200, "canonical retranslate status");
    assert.equal(canonicalRetranslate.body.data.item.id, summaryItem.id);
    assert.equal(canonicalRetranslate.body.data.item.review_status, "ai_draft");
    assert.ok(canonicalRetranslate.body.data.item.ai_draft.startsWith("【TR-1】[vi] "));
    assert.equal(canonicalRetranslate.body.data.job, null);
    assert.equal(readIssue(config, issue.id).fields_json.summary.cis, "Backlog summary for translate");

    // Happy case 3: draft save does not apply canonical; approval does.
    const descriptionItem = canonicalTranslate.body.data.translations.find((item) => item.target_field === "description");
    const manualEdit = await requestJson(server, {
      method: "PUT",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${descriptionItem.id}/draft`,
      token,
      body: {
        draft_text: "Ban dich da chinh sua happy case",
        review_notes: "translation-routes-happy-case",
      },
    });
    assert.equal(manualEdit.status, 200);
    assert.equal(manualEdit.body.data.review_status, "ai_draft");

    const afterManualEdit = readIssue(config, issue.id);
    assert.notEqual(afterManualEdit.fields_json.description.cis, "Ban dich da chinh sua happy case");
    const approveDraft = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${descriptionItem.id}/approve`,
      token,
      body: { review_notes: "translation-routes-approve-draft" },
    });
    assert.equal(approveDraft.status, 200);
    assert.equal(readIssue(config, issue.id).fields_json.description.cis, "Ban dich da chinh sua happy case");

    // Happy case 4: another issue in the same Project remains supported
    const compatTranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${compatIssue.id}/translations/translate`,
      token,
    });
    assert.equal(compatTranslate.status, 200, "second issue translate status");
    assert.equal(compatTranslate.body.data.translated_items.length, 2);
    assert.ok(compatTranslate.body.data.translations.every((item) => item.review_status === "ai_draft"));

    const compatSummary = compatTranslate.body.data.translations.find((item) => item.target_field === "summary");
    const compatRetranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${compatIssue.id}/translations/${compatSummary.id}/translate`,
      token,
    });
    assert.equal(compatRetranslate.status, 200, "second issue retranslate status");
    assert.equal(compatRetranslate.body.data.item.review_status, "ai_draft");
    assert.equal(readIssue(config, compatIssue.id).fields_json.summary.cis, "Backlog summary for translate");

    const legacyTranslate = await requestJson(server, {
      method: "POST",
      pathname: ["", "api", "v1", "translations", "issues", issue.id, "translate"].join("/"),
      token,
    });
    assert.equal(legacyTranslate.status, 404);

    // Happy case 5: editor read model still returns translation block
    const editor = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/editor`,
      token,
    });
    assert.equal(editor.status, 200);
    assert.equal(editor.body.data.translation.total, 2);
    assert.ok(editor.body.data.translations.some((item) => item.target_field === "description"));
    assert.equal(
      editor.body.data.translations.find((item) => item.target_field === "description").ai_draft,
      "Ban dich da chinh sua happy case"
    );
  });

  console.log("Translation issue routes happy-case verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
