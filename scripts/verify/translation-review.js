const assert = require("assert");
const path = require("path");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const TranslationApi = require("../../src/modules/Translation/TranslationApi");
const { makeTempConfig } = require("./helpers/tempConfig");
const { requestJson, withServer } = require("./helpers/http");

const fakeCodexPath = path.resolve(__dirname, "fakes", "codex-exec.js");

function fakeCommand(mode) {
  return `"${process.execPath}" "${fakeCodexPath}" ${mode}`;
}

function setupConfig(name, mode, overrides = {}) {
  const config = makeTempConfig(name, {
    CODEX_EXEC_COMMAND: fakeCommand(mode),
    CODEX_EXEC_TIMEOUT_SECONDS: "2",
    ADMIN_EMAIL: `${name}@example.test`,
    ADMIN_PASSWORD: "verify-password",
    ...overrides,
  });
  ensureStorage(config.storage);
  migrate({ config });
  return config;
}

function createProject(config, suffix = "TRAN") {
  return ProjectsApi.createProject({
    config,
    input: {
      name: `Translation Verify ${suffix}`,
      sync_enabled: true,
      backlog_project_key: suffix,
      backlog_issue_key_prefix: suffix,
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_project_key: suffix,
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_API_TOKEN",
      translation_ai_provider: "codex_exec",
      source_language: "ja",
      target_language: "vi",
      translation_glossary_json: [
        { source: "\u78ba\u8a8d", target: "xac nhan" },
        { source: "\u7ba1\u7406\u753b\u9762", target: "man hinh quan tri" },
      ],
      auto_translate: true,
    },
  });
}

function createIssueWithTranslations(config, count = 1, overrides = {}) {
  const project = overrides.project || createProject(config, `TR${Math.floor(Math.random() * 100000)}`);
  const issueNumber = overrides.issue_number || Math.floor(Math.random() * 1000000) + 1;
  const sourceText = [
    "\u30ed\u30b0\u30a4\u30f3\u753b\u9762\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    "WEC-123 \u3068 https://example.test \u306f\u4fdd\u6301\u3057\u307e\u3059\u3002",
    "```js\nconst a = 1;\n```",
  ].join("\n");
  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: `${project.backlog_project_key}-${issueNumber}`,
      source_system: "backlog",
      status: "pending_translate",
      fields_json: {
        summary: { backlog: `${sourceText}\n#1` },
        description: { backlog: `${sourceText}\n#2` },
      },
    },
  });

  const items = [];
  for (let index = 0; index < count; index += 1) {
    items.push(CisApi.createTranslationQueueItem({
      config,
      input: {
        project_id: project.id,
        issue_id: issue.id,
        target_type: overrides.target_type || "issue",
        target_field: overrides.target_type === "comment" ? undefined : (index === 0 ? "summary" : "description"),
        source_language: "ja",
        target_language: "vi",
        source_text: `${sourceText}\n#${index + 1}`,
        ...(Object.prototype.hasOwnProperty.call(overrides, "provider") ? { provider: overrides.provider } : { provider: "codex_exec" }),
      },
    }));
  }

  return { issue, items, project };
}

function enqueueTranslate(config, item, input = {}) {
  return SyncApi.enqueueJob({
    config,
    input: {
      project_id: item.project_id,
      issue_id: item.issue_id,
      comment_id: item.comment_id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "translate",
      payload_json: {
        translation_queue_id: item.id,
      },
      trigger: "manual",
      ...input,
    },
  });
}

function getIssueStatus(config, issueId) {
  return CisApi.getIssueById({ config, issueId }).status;
}

function getTranslation(config, queueId) {
  return TranslationApi.getTranslationQueueItem({ config, queueId });
}

function getTranslationJournal(config, issueId) {
  return SyncApi.listJournal({ config, filters: { issue_id: issueId } })
    .filter((entry) => entry.action === "translation_ai_draft");
}

function assertJournalHas(config, action, issueId) {
  const entries = SyncApi.listJournal({ config, filters: { issue_id: issueId } });
  assert.ok(entries.some((entry) => entry.action === action), `Missing journal action ${action}`);
}

async function verifySuccessAndReviewApi() {
  const config = setupConfig("translation-success", "success");
  AuthApi.bootstrapAdmin({
    config,
    email: "translation-success@example.test",
    password: "verify-password",
  });

  const { issue, items, project } = createIssueWithTranslations(config, 2);
  const collected = TranslationApi.collectTranslationContext({ config, item: items[0] });
  assert.equal(collected.context_bundle.glossary.length, 2);
  assert.equal(collected.context_bundle.translation_memory.length, 0);
  assert.equal(collected.context_bundle.issue_keys.backlog_issue_key, issue.backlog_issue_key);

  const standardInput = TranslationApi.buildStandardTranslationInput({
    item: items[0],
    issue,
    context_policy: collected.context_policy,
    context_bundle: collected.context_bundle,
  });
  assert.equal(standardInput.source_text, items[0].source_text);
  assert.equal(standardInput.context_bundle.glossary[0].target, "xac nhan");

  enqueueTranslate(config, items[0]);
  enqueueTranslate(config, items[1]);

  const firstWorker = await SyncApi.runWorkerOnce({ config, workerId: "translation-verify" });
  assert.equal(firstWorker.job.status, "success");
  let first = getTranslation(config, items[0].id);
  assert.equal(first.review_status, "ai_draft");
  assert.equal(first.provider, "codex_exec");
  assert.ok(first.model_or_command.includes("codex-exec.js"));
  assert.equal(first.confidence, 0.82);
  assert.match(first.ai_draft, /^\[vi\]/);
  assert.ok(first.ai_draft.includes("```js\nconst a = 1;\n```"));
  assert.equal(getIssueStatus(config, issue.id), "pending_translate");

  const firstJournal = getTranslationJournal(config, issue.id)[0];
  assert.equal(firstJournal.details_json.context_policy, "default_translation");
  assert.equal(firstJournal.details_json.glossary_count, 2);
  assert.equal(firstJournal.details_json.translation_memory_count, 0);
  assert.equal(firstJournal.details_json.neighbor_comments_count, 0);
  assert.equal(firstJournal.details_json.signals.contains_japanese, true);

  const secondWorker = await SyncApi.runWorkerOnce({ config, workerId: "translation-verify" });
  assert.equal(secondWorker.job.status, "success");
  assert.equal(getIssueStatus(config, issue.id), "pending_review");
  assertJournalHas(config, "translation_ai_draft", issue.id);

  const app = createApp({ config });
  await withServer(app, async (server) => {
    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: {
        email: "translation-success@example.test",
        password: "verify-password",
      },
    });
    assert.equal(login.status, 200);
    const token = login.body.data.token;

    const list = await requestJson(server, {
      pathname: "/api/v1/translation-queue?review_status=ai_draft",
      token,
    });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.some((item) => item.id === items[0].id));

    const detail = await requestJson(server, {
      pathname: `/api/v1/translation-queue/${items[0].id}`,
      token,
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.id, items[0].id);

    const approve = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/translation-queue/${items[0].id}/approve`,
      token,
      body: { review_notes: "ok" },
    });
    assert.equal(approve.status, 200);
    assert.equal(approve.body.data.review_status, "approved");
    assert.equal(getIssueStatus(config, issue.id), "pending_review");

    const followUp = createIssueWithTranslations(config, 1, { project }).items[0];
    const followUpContext = TranslationApi.collectTranslationContext({ config, item: followUp });
    assert.ok(followUpContext.context_bundle.translation_memory.length >= 1);

    const edit = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/translation-queue/${items[1].id}/manual-edit`,
      token,
      body: {
        reviewed_text: "Ban dich da chinh sua.",
        review_notes: "manual",
      },
    });
    assert.equal(edit.status, 200);
    assert.equal(edit.body.data.review_status, "edited");
    assert.equal(edit.body.data.reviewed_text, "Ban dich da chinh sua.");
    assert.equal(getIssueStatus(config, issue.id), "update_pending");
    assert.equal(CisApi.getIssueById({ config, issueId: issue.id }).fields_json.description.cis, "Ban dich da chinh sua.");

    const rejectTarget = createIssueWithTranslations(config, 1).items[0];
    enqueueTranslate(config, rejectTarget);
    await SyncApi.runWorkerOnce({ config, workerId: "translation-verify" });

    const reject = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/translation-queue/${rejectTarget.id}/reject`,
      token,
      body: { review_notes: "retry please" },
    });
    assert.equal(reject.status, 200);
    assert.equal(reject.body.data.review_status, "rejected");

    const retranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/translation-queue/${rejectTarget.id}/retranslate`,
      token,
    });
    assert.equal(retranslate.status, 202);
    assert.equal(retranslate.body.data.item.review_status, "pending");
    assert.equal(retranslate.body.data.job.job_type, "translate");

    const retranslateWorker = await SyncApi.runWorkerOnce({ config, workerId: "translation-verify" });
    assert.equal(retranslateWorker.job.status, "success");
    assert.equal(getTranslation(config, rejectTarget.id).review_status, "ai_draft");
  });

  assertJournalHas(config, "translation_approved", issue.id);
  assertJournalHas(config, "translation_manual_edited", issue.id);
}

async function verifyProviderFailure(mode, expectedErrorCode) {
  const config = setupConfig(`translation-${mode}`, mode, {
    CODEX_EXEC_TIMEOUT_SECONDS: "1",
  });
  const { items } = createIssueWithTranslations(config, 1);
  const job = enqueueTranslate(config, items[0], { max_attempts: 1 });

  const result = await SyncApi.runWorkerOnce({ config, workerId: `translation-${mode}` });
  assert.equal(result.job.id, job.id);
  assert.equal(result.job.status, "failed");
  assert.match(result.job.last_error, /codex_exec/i);

  const item = getTranslation(config, items[0].id);
  assert.equal(item.provider_error, expectedErrorCode);
}

async function verifyLowConfidenceAnomaly() {
  const config = setupConfig("translation-low-confidence", "low-confidence");
  const { issue, items } = createIssueWithTranslations(config, 1);
  enqueueTranslate(config, items[0]);

  const result = await SyncApi.runWorkerOnce({ config, workerId: "translation-low-confidence" });
  assert.equal(result.job.status, "success");

  const db = createConnection({ config });
  const anomaly = db
    .prepare("SELECT * FROM anomaly_log WHERE issue_id = ? AND anomaly_type = 'translation_low_conf'")
    .get(issue.id);
  db.close();
  assert.ok(anomaly);
}

async function verifyDeepSeekProvider() {
  const config = setupConfig("translation-deepseek", "success", {
    DEEPSEEK_API_KEY: "test-deepseek-key",
  });
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Translation Verify DeepSeek",
      sync_enabled: true,
      backlog_project_key: "DS",
      backlog_issue_key_prefix: "DS",
      jira_project_key: "DS",
      translation_ai_provider: "deepseek",
      translation_ai_transport: "openai_compatible",
      translation_ai_model: "deepseek-v4-flash",
      auto_translate: true,
    },
  });
  const { items } = createIssueWithTranslations(config, 1, { project, provider: undefined });
  enqueueTranslate(config, items[0]);

  const originalFetch = global.fetch;
  let capturedBody = null;
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    assert.equal(options.headers.authorization, "Bearer test-deepseek-key");
    capturedBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          id: "deepseek-test-request",
          choices: [
            {
              message: {
                content: JSON.stringify({
                  translated_text: "[vi] ban dich deepseek",
                  confidence: 0.91,
                  warnings: [],
                  preserved_blocks: true,
                }),
              },
            },
          ],
        };
      },
    };
  };

  try {
    const result = await SyncApi.runWorkerOnce({ config, workerId: "translation-deepseek" });
    assert.equal(result.job.status, "success");
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(capturedBody.model, "deepseek-v4-flash");
  assert.equal(capturedBody.thinking.type, "disabled");
  assert.equal(Object.prototype.hasOwnProperty.call(capturedBody, "reasoning_effort"), false);
  const item = getTranslation(config, items[0].id);
  assert.equal(item.provider, "deepseek");
  assert.equal(item.ai_transport, "openai_compatible");
  assert.equal(item.model_or_command, "deepseek-v4-flash");
  assert.equal(item.provider_request_id, "deepseek-test-request");
  assert.equal(item.ai_draft, "[vi] ban dich deepseek");
}

async function verifyDeepSeekAnthropicTransport() {
  const config = setupConfig("translation-deepseek-anthropic", "success", {
    DEEPSEEK_API_KEY: "test-deepseek-key",
  });
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Translation Verify DeepSeek Anthropic",
      sync_enabled: true,
      backlog_project_key: "DSA",
      backlog_issue_key_prefix: "DSA",
      jira_project_key: "DSA",
      translation_ai_provider: "deepseek",
      translation_ai_transport: "anthropic_compatible",
      translation_ai_model: "deepseek-v4-pro",
      auto_translate: true,
    },
  });
  const { items } = createIssueWithTranslations(config, 1, { project, provider: undefined });
  enqueueTranslate(config, items[0]);

  const originalFetch = global.fetch;
  let capturedBody = null;
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.deepseek.com/anthropic/v1/messages");
    assert.equal(options.headers["x-api-key"], "test-deepseek-key");
    capturedBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          id: "deepseek-anthropic-test-request",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                translated_text: "[vi] ban dich anthropic",
                confidence: 0.9,
                warnings: [],
                preserved_blocks: [],
              }),
            },
          ],
        };
      },
    };
  };

  try {
    const result = await SyncApi.runWorkerOnce({ config, workerId: "translation-deepseek-anthropic" });
    assert.equal(result.job.status, "success");
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(capturedBody.model, "deepseek-v4-pro");
  assert.equal(capturedBody.thinking.type, "disabled");
  const item = getTranslation(config, items[0].id);
  assert.equal(item.provider, "deepseek");
  assert.equal(item.ai_transport, "anthropic_compatible");
  assert.equal(item.model_or_command, "deepseek-v4-pro");
  assert.equal(item.provider_request_id, "deepseek-anthropic-test-request");
  assert.equal(item.ai_draft, "[vi] ban dich anthropic");
}

async function verifyStaleQueueUsesCurrentProjectAiConfig() {
  const config = setupConfig("translation-stale-ai-config", "success", {
    DEEPSEEK_API_KEY: "test-deepseek-key",
  });
  const project = createProject(config, "STALE");
  const { items } = createIssueWithTranslations(config, 1, { project, provider: undefined });

  assert.equal(items[0].provider, "codex_exec");
  ProjectsApi.updateProject({
    config,
    projectId: project.id,
    input: {
      translation_ai_provider: "deepseek",
      translation_ai_transport: "openai_compatible",
      translation_ai_model: "deepseek-v4-flash",
    },
  });
  enqueueTranslate(config, items[0]);

  const originalFetch = global.fetch;
  let fetchCalled = false;
  global.fetch = async (url, options) => {
    fetchCalled = true;
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    assert.equal(options.headers.authorization, "Bearer test-deepseek-key");
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          id: "deepseek-refreshed-config-request",
          choices: [
            {
              message: {
                content: JSON.stringify({
                  translated_text: "[vi] refreshed config",
                  confidence: 0.93,
                  warnings: [],
                  preserved_blocks: true,
                }),
              },
            },
          ],
        };
      },
    };
  };

  try {
    const result = await SyncApi.runWorkerOnce({ config, workerId: "translation-stale-ai-config" });
    assert.equal(result.job.status, "success");
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(fetchCalled, true);
  const item = getTranslation(config, items[0].id);
  assert.equal(item.provider, "deepseek");
  assert.equal(item.ai_transport, "openai_compatible");
  assert.equal(item.model_or_command, "deepseek-v4-flash");
  assert.equal(item.provider_request_id, "deepseek-refreshed-config-request");
  assert.equal(item.ai_draft, "[vi] refreshed config");
}

async function main() {
  await verifySuccessAndReviewApi();
  await verifyProviderFailure("timeout", "CODEX_EXEC_TIMEOUT");
  await verifyProviderFailure("invalid-json", "CODEX_EXEC_PARSE_ERROR");
  await verifyLowConfidenceAnomaly();
  await verifyDeepSeekProvider();
  await verifyDeepSeekAnthropicTransport();
  await verifyStaleQueueUsesCurrentProjectAiConfig();

  console.log("Translation review verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
