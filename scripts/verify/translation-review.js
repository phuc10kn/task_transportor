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
const { createSyncJobRepository } = require("../../src/modules/Sync/infrastructure/SyncJobRepository");
const TranslationApi = require("../../src/modules/Translation/TranslationApi");
const { createTranslationRepository } = require("../../src/modules/Translation/infrastructure/TranslationRepository");
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
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: `Translation Verify ${suffix}`,
      sync_enabled: true,
      backlog_space_url: "https://cdrive.backlog.com",
      backlog_project_key: suffix,
      backlog_issue_key_prefix: suffix,
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_project_key: suffix,
      jira_site_url: "https://translation-verify.atlassian.net",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_API_TOKEN",
      translation_ai_provider: "codex_exec",
      source_language: "ja",
      target_language: "vi",
      auto_translate: true,
    },
  });

  TranslationApi.createTranslationGlossaryConcept({
    config,
    projectId: project.id,
    input: {
      group_key: "default",
      concept_key: "confirm",
      terms: [
        { language_code: "ja", term: "\u78ba\u8a8d", is_canonical: true },
        { language_code: "vi", term: "xac nhan", is_canonical: true },
      ],
    },
  });
  TranslationApi.createTranslationGlossaryConcept({
    config,
    projectId: project.id,
    input: {
      group_key: "default",
      concept_key: "admin-screen",
      terms: [
        { language_code: "ja", term: "\u7ba1\u7406\u753b\u9762", is_canonical: true },
        { language_code: "vi", term: "man hinh quan tri", is_canonical: true },
      ],
    },
  });

  return project;
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

function verifyAtomicBatchRollback() {
  const config = setupConfig("translation-batch-rollback", "success");
  const { issue, items } = createIssueWithTranslations(config, 2);
  const repository = createTranslationRepository({ config });
  for (const item of items) {
    repository.markAiDraft(item.id, {
      ai_draft: `[vi] ${item.source_text}`,
      provider: "codex_exec",
      model_or_command: "fake-success",
      confidence: 0.9,
    });
  }
  const before = CisApi.getIssueEditor({ config, issueId: issue.id });
  const db = createConnection({ config });
  db.exec(`CREATE TRIGGER verify_translation_batch_rollback
    BEFORE UPDATE OF review_status ON translation_queue
    WHEN NEW.id = ${Number(items[1].id)} AND NEW.review_status = 'approved'
    BEGIN SELECT RAISE(ABORT, 'forced batch failure'); END;`);
  db.close();

  assert.throws(() => TranslationApi.approveTranslationBatch({
    config,
    queueIds: items.map((item) => item.id),
    reviewedBy: null,
    parentSyncJobId: "verify-parent",
  }), /forced batch failure/);
  const after = CisApi.getIssueEditor({ config, issueId: issue.id });
  assert.equal(after.canonical.summary.value, before.canonical.summary.value);
  assert.equal(after.canonical.description.value, before.canonical.description.value);
  assert.deepEqual(
    createTranslationRepository({ config }).list({ issue_id: issue.id }).map((item) => item.review_status),
    ["ai_draft", "ai_draft"],
  );
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
  assert.equal(collected.context_bundle.glossary.length, 1);
  assert.equal(collected.context_bundle.translation_memory.length, 0);
  assert.equal(collected.context_bundle.issue_keys.backlog_issue_key, issue.backlog_issue_key);

  const standardInput = TranslationApi.buildStandardTranslationInput({
    item: items[0],
    issue,
    context_policy: collected.context_policy,
    context_bundle: collected.context_bundle,
  });
  assert.equal(standardInput.source_text, items[0].source_text);
  assert.ok(standardInput.context_bundle.glossary.some((entry) => entry.target === "xac nhan"));

  enqueueTranslate(config, items[0]);
  enqueueTranslate(config, items[1]);

  const firstWorker = await SyncApi.runWorkerOnce({ config, workerId: "translation-verify" });
  assert.equal(firstWorker.job.status, "success");
  let first = getTranslation(config, items[0].id);
  assert.equal(first.review_status, "ai_draft");
  assert.equal(first.provider, "codex_exec");
  assert.ok(first.model_or_command.includes("codex-exec.js"));
  assert.equal(first.confidence, 0.82);
  assert.match(first.ai_draft, new RegExp(`^【${issue.backlog_issue_key}】\\[vi\\]`));
  assert.ok(first.ai_draft.includes("```js\nconst a = 1;\n```"));
  assert.equal(getIssueStatus(config, issue.id), "pending_translate");

  const firstJournal = getTranslationJournal(config, issue.id)[0];
  assert.equal(firstJournal.details_json.context_policy, "default_translation");
  assert.equal(firstJournal.details_json.glossary_count, 1);
  assert.equal(firstJournal.details_json.translation_memory_count, 0);
  assert.equal(firstJournal.details_json.neighbor_comments_count, 0);
  assert.equal(firstJournal.details_json.signals.contains_japanese, true);

  const secondWorker = await SyncApi.runWorkerOnce({ config, workerId: "translation-verify" });
  assert.equal(secondWorker.job.status, "success");
  const second = getTranslation(config, items[1].id);
  const sourceLink = `https://cdrive.backlog.com/view/${issue.backlog_issue_key}`;
  assert.ok(second.ai_draft.startsWith(`${sourceLink}\n\n[vi]`));
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

    const staleSetup = createIssueWithTranslations(config, 1, { project });
    const staleDb = createConnection({ config });
    staleDb.prepare(
      "UPDATE translation_queue SET source_text = ?, ai_draft = ?, review_status = 'ai_draft' WHERE id = ?"
    ).run("Old source", "Draft preserved across source change", staleSetup.items[0].id);
    staleDb.close();
    const staleList = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/translation-queue?issue_id=${staleSetup.issue.id}`,
      token,
    });
    assert.equal(staleList.status, 200);
    assert.equal(staleList.body.data[0].is_source_stale, true);
    assert.equal(staleList.body.data[0].ai_draft, "Draft preserved across source change");
    assert.equal(staleList.body.data[0].source_text, staleSetup.items[0].source_text);
    const staleApprove = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${staleSetup.items[0].id}/approve`,
      token,
    });
    assert.equal(staleApprove.status, 409, JSON.stringify(staleApprove.body));
    assert.equal(staleApprove.body.error.code, "TRANSLATION_SOURCE_STALE");
    const reconciledDraft = await requestJson(server, {
      method: "PUT",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${staleSetup.items[0].id}/draft`,
      token,
      body: { draft_text: "Human reconciled draft" },
    });
    assert.equal(reconciledDraft.status, 200);
    assert.equal(reconciledDraft.body.data.source_text, staleSetup.items[0].source_text);
    assert.equal(reconciledDraft.body.data.ai_draft, "Human reconciled draft");

    const list = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/translation-queue?review_status=ai_draft`,
      token,
    });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.some((item) => item.id === items[0].id));
    const listedItem = list.body.data.find((item) => item.id === items[0].id);
    assert.equal(listedItem.source_system, "backlog");
    assert.equal(listedItem.system_issue_key, issue.backlog_issue_key);

    const detail = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/translation-queue/${items[0].id}`,
      token,
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.id, items[0].id);

    const approve = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${items[0].id}/approve`,
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
      method: "PUT",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${items[1].id}/draft`,
      token,
      body: {
        draft_text: "Ban dich da chinh sua.",
        review_notes: "manual",
      },
    });
    assert.equal(edit.status, 200);
    assert.equal(edit.body.data.review_status, "ai_draft");
    assert.equal(edit.body.data.ai_draft, `${sourceLink}\n\nBan dich da chinh sua.`);
    assert.notEqual(CisApi.getIssueById({ config, issueId: issue.id }).fields_json.description.cis, "Ban dich da chinh sua.");

    const approveEditedDraft = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${items[1].id}/approve`,
      token,
      body: { review_notes: "approve edited draft" },
    });
    assert.equal(approveEditedDraft.status, 200);
    assert.equal(approveEditedDraft.body.data.review_status, "approved");
    assert.equal(
      CisApi.getIssueById({ config, issueId: issue.id }).fields_json.description.cis,
      `${sourceLink}\n\nBan dich da chinh sua.`
    );
    assert.equal(getIssueStatus(config, issue.id), "approved");

    const rejectSetup = createIssueWithTranslations(config, 1);
    const rejectTarget = rejectSetup.items[0];
    enqueueTranslate(config, rejectTarget);
    await SyncApi.runWorkerOnce({ config, workerId: "translation-verify" });

    const projectQueue = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/translation-queue`,
      token,
    });
    assert.equal(projectQueue.status, 200);
    assert.equal(projectQueue.body.data.some((item) => item.id === rejectTarget.id), false);
    const beforeCrossProjectDb = createConnection({ config });
    const journalBeforeCrossProject = beforeCrossProjectDb.prepare("SELECT COUNT(*) AS total FROM sync_journal").get().total;
    beforeCrossProjectDb.close();
    const crossProjectDraft = await requestJson(server, {
      method: "PUT",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${rejectTarget.id}/draft`,
      token,
      body: { draft_text: "Must not cross projects" },
    });
    assert.equal(crossProjectDraft.status, 404);
    assert.equal(crossProjectDraft.body.error.code, "RESOURCE_NOT_FOUND");
    assert.notEqual(getTranslation(config, rejectTarget.id).ai_draft, "Must not cross projects");
    const afterCrossProjectDb = createConnection({ config });
    assert.equal(afterCrossProjectDb.prepare("SELECT COUNT(*) AS total FROM sync_journal").get().total, journalBeforeCrossProject);
    afterCrossProjectDb.close();

    const reject = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${rejectSetup.project.id}/translation-queue/${rejectTarget.id}/reject`,
      token,
      body: { review_notes: "retry please" },
    });
    assert.equal(reject.status, 200);
    assert.equal(reject.body.data.review_status, "rejected");

    const retranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${rejectSetup.project.id}/translation-queue/${rejectTarget.id}/retranslate`,
      token,
    });
    assert.equal(retranslate.status, 202);
    assert.equal(retranslate.body.data.item.review_status, "pending");
    assert.equal(retranslate.body.data.job.job_type, "translate");

    const legacyQueue = await requestJson(server, { pathname: ["", "api", "v1", "translation-queue"].join("/"), token });
    assert.equal(legacyQueue.status, 404);

    const retranslateWorker = await SyncApi.runWorkerOnce({ config, workerId: "translation-verify" });
    assert.equal(retranslateWorker.job.status, "success");
    assert.equal(getTranslation(config, rejectTarget.id).review_status, "ai_draft");
  });

  assertJournalHas(config, "translation_approved", issue.id);
  assertJournalHas(config, "translation_draft_saved", issue.id);
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

async function verifyManualEntryPointGate() {
  const config = setupConfig("translation-entry-gate", "success");
  AuthApi.bootstrapAdmin({
    config,
    email: "translation-entry-gate@example.test",
    password: "verify-password",
  });
  const { issue, items, project } = createIssueWithTranslations(config, 1);
  const active = enqueueTranslate(config, items[0]);
  const locked = createSyncJobRepository({ config }).lockById({
    jobId: active.id,
    workerId: "translation-entry-gate-lock",
  });
  assert.equal(locked.status, "running");

  const app = createApp({ config });
  await withServer(app, async (server) => {
    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: {
        email: "translation-entry-gate@example.test",
        password: "verify-password",
      },
    });
    const token = login.body.data.token;
    const issueTranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/translations/translate`,
      token,
    });
    assert.equal(issueTranslate.status, 202);
    assert.equal(issueTranslate.body.data.execution_status, "partial_queued");
    assert.ok(issueTranslate.body.data.queued_job_ids.includes(active.id));

    const retranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${items[0].id}/retranslate`,
      token,
    });
    assert.equal(retranslate.status, 202);
    assert.equal(retranslate.body.data.reused, true);
    assert.equal(retranslate.body.data.job.id, active.id);
    assert.equal(retranslate.body.data.item.review_status, "pending");
  });

  const db = createConnection({ config });
  assert.equal(db.prepare(
    "SELECT COUNT(*) AS total FROM sync_jobs WHERE job_type = 'translate' AND status IN ('pending', 'running') AND json_extract(payload_json, '$.translation_queue_id') = ?"
  ).get(items[0].id).total, 1);
  db.close();
}

async function verifyDirectFailureFeedback() {
  const config = setupConfig("translation-direct-failure", "invalid-json");
  AuthApi.bootstrapAdmin({
    config,
    email: "translation-direct-failure@example.test",
    password: "verify-password",
  });
  const { issue, project } = createIssueWithTranslations(config, 1);
  const app = createApp({ config });
  await withServer(app, async (server) => {
    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: {
        email: "translation-direct-failure@example.test",
        password: "verify-password",
      },
    });
    const response = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/translations/translate`,
      token: login.body.data.token,
    });
    assert.equal(response.status, 502);
    assert.equal(response.body.error.code, "TRANSLATION_JOB_FAILED");
    assert.ok(response.body.error.details.job_id);
    assert.equal(response.body.error.details.status, "failed");
  });
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
  const { issue, items } = createIssueWithTranslations(config, 1, { project, provider: undefined });
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
                  translated_text: `【${issue.backlog_issue_key}】[vi] ban dich deepseek【${issue.backlog_issue_key}】`,
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
  assert.equal(capturedBody.temperature, 0.2);
  assert.equal(capturedBody.thinking.type, "disabled");
  assert.equal(Object.prototype.hasOwnProperty.call(capturedBody, "reasoning_effort"), false);
  const item = getTranslation(config, items[0].id);
  assert.equal(item.provider, "deepseek");
  assert.equal(item.ai_transport, "openai_compatible");
  assert.equal(item.model_or_command, "deepseek-v4-flash");
  assert.equal(item.provider_request_id, "deepseek-test-request");
  assert.equal(item.ai_draft, `【${issue.backlog_issue_key}】[vi] ban dich deepseek`);
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
  assert.equal(item.ai_draft, `【${CisApi.getIssueById({ config, issueId: item.issue_id }).backlog_issue_key}】[vi] ban dich anthropic`);
}

async function verifyOpenAiProvider() {
  const config = setupConfig("translation-openai", "success", {
    OPENAI_API_KEY: "test-openai-key",
  });
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Translation Verify OpenAI",
      sync_enabled: true,
      backlog_project_key: "OAI",
      backlog_issue_key_prefix: "OAI",
      jira_project_key: "OAI",
      translation_ai_provider: "openai",
      translation_ai_transport: "openai_compatible",
      translation_ai_model: "gpt-5.6-terra",
      auto_translate: true,
    },
  });
  const { issue, items } = createIssueWithTranslations(config, 1, { project, provider: undefined });
  enqueueTranslate(config, items[0]);

  const originalFetch = global.fetch;
  let capturedBody = null;
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/chat/completions");
    assert.equal(options.headers.authorization, "Bearer test-openai-key");
    capturedBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          id: "openai-test-request",
          choices: [{
            message: {
              content: JSON.stringify({
                translated_text: "[vi] ban dich openai",
                confidence: 0.94,
                warnings: [],
                preserved_blocks: true,
              }),
            },
          }],
        };
      },
    };
  };

  try {
    const result = await SyncApi.runWorkerOnce({ config, workerId: "translation-openai" });
    assert.equal(result.job.status, "success");
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(capturedBody.model, "gpt-5.6-terra");
  assert.equal(capturedBody.temperature, 1);
  assert.equal(Object.prototype.hasOwnProperty.call(capturedBody, "thinking"), false);
  const item = getTranslation(config, items[0].id);
  assert.equal(item.provider, "openai");
  assert.equal(item.ai_transport, "openai_compatible");
  assert.equal(item.model_or_command, "gpt-5.6-terra");
  assert.equal(item.provider_request_id, "openai-test-request");
  assert.equal(item.ai_draft, `【${issue.backlog_issue_key}】[vi] ban dich openai`);
}

async function verifyOpenAiMissingKey() {
  const config = setupConfig("translation-openai-missing-key", "success");
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Translation Verify OpenAI Missing Key",
      sync_enabled: true,
      backlog_project_key: "OAIM",
      backlog_issue_key_prefix: "OAIM",
      jira_project_key: "OAIM",
      translation_ai_provider: "openai",
      translation_ai_transport: "openai_compatible",
      translation_ai_model: "gpt-4.1-mini",
      auto_translate: true,
    },
  });
  const { items } = createIssueWithTranslations(config, 1, { project, provider: undefined });
  enqueueTranslate(config, items[0], { max_attempts: 1 });

  const result = await SyncApi.runWorkerOnce({ config, workerId: "translation-openai-missing-key" });
  assert.equal(result.job.status, "failed");
  assert.match(result.job.last_error, /OPENAI_API_KEY is required/);
  assert.equal(getTranslation(config, items[0].id).provider_error, "OPENAI_API_KEY_MISSING");
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
  assert.equal(item.ai_draft, `【${CisApi.getIssueById({ config, issueId: item.issue_id }).backlog_issue_key}】[vi] refreshed config`);
}

async function main() {
  verifyAtomicBatchRollback();
  await verifySuccessAndReviewApi();
  await verifyManualEntryPointGate();
  await verifyDirectFailureFeedback();
  await verifyProviderFailure("timeout", "CODEX_EXEC_TIMEOUT");
  await verifyProviderFailure("invalid-json", "CODEX_EXEC_PARSE_ERROR");
  await verifyLowConfidenceAnomaly();
  await verifyDeepSeekProvider();
  await verifyDeepSeekAnthropicTransport();
  await verifyOpenAiProvider();
  await verifyOpenAiMissingKey();
  await verifyStaleQueueUsesCurrentProjectAiConfig();

  console.log("Translation review verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
