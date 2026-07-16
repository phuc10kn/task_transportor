const assert = require("assert");
const { execFile, execFileSync } = require("child_process");
const path = require("path");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const MappingApi = require("../../src/modules/Mapping/MappingApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const TranslationApi = require("../../src/modules/Translation/TranslationApi");
const { createSyncJobRepository } = require("../../src/modules/Sync/infrastructure/SyncJobRepository");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function tableCount(config, table) {
  const db = createConnection({ config });
  try { return db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total; }
  finally { db.close(); }
}

function createApprovedMapping(config, projectId, mappingType, fromValue, cisValue, jiraValue) {
  const inbound = MappingApi.createMappingRule({
    config,
    input: { project_id: projectId, mapping_type: mappingType, direction_from: "backlog", direction_to: "cis", from_value: fromValue, to_value: cisValue },
  });
  MappingApi.approveMappingRule({ config, ruleId: inbound.id, approvedBy: 1 });
  const outbound = MappingApi.createMappingRule({
    config,
    input: { project_id: projectId, mapping_type: mappingType, direction_from: "cis", direction_to: "jira", from_value: cisValue, to_value: jiraValue },
  });
  MappingApi.approveMappingRule({ config, ruleId: outbound.id, approvedBy: 1 });
}

function runConcurrentUpsert(config, projectId, key) {
  const helper = path.join(__dirname, "helpers", "upsert-backlog-once.js");
  const env = {
    ...process.env,
    DATABASE_PATH: config.database.path,
    STORAGE_ROOT: config.storage.root,
    ATTACHMENT_STORAGE_PATH: config.storage.attachments,
  };
  const run = () => new Promise((resolve, reject) => execFile(process.execPath, [helper, String(projectId), key], { env }, (error) => error ? reject(error) : resolve()));
  return Promise.all([run(), run()]);
}

async function main() {
  for (const order of [
    ["Cis/CisApi", "Backlog/BacklogApi", "Jira/JiraApi"],
    ["Jira/JiraApi", "Backlog/BacklogApi", "Cis/CisApi"],
  ]) {
    execFileSync(process.execPath, ["-e", order.map((modulePath) => `require('./src/modules/${modulePath}')`).join(";")], { cwd: path.resolve(__dirname, "../..") });
  }
  const config = makeTempConfig("system-issues", {
    ADMIN_EMAIL: "system-issues@example.test",
    ADMIN_PASSWORD: "verify-password",
    BACKLOG_FAKE_FIXTURE_PATH: path.join(__dirname, "fixtures", "backlog-issue-filter.json"),
    JIRA_FAKE_MODE: "1",
    JIRA_FAKE_SEED_PATH: path.join(__dirname, "fixtures", "jira-system-issues.json"),
    WORKER_ENABLED: "true",
    CODEX_EXEC_COMMAND: `"${process.execPath}" "${path.join(__dirname, "fakes", "codex-exec.js")}" success`,
  });
  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({ config, email: "system-issues@example.test", password: "verify-password" });
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "System Issues",
      enabled: true,
      sync_enabled: true,
      manual_pull_enabled: true,
      backlog_space_url: "https://example.backlog.com",
      backlog_project_key: "WEC",
      backlog_issue_key_prefix: "WEC",
      backlog_api_key_env: "BACKLOG_API_KEY_WEC",
      jira_site_url: "https://example.atlassian.net",
      jira_project_key: "WEC",
      jira_email: "system-issues@example.test",
      jira_api_token: "system-issues-token",
      translation_ai_provider: "codex_exec",
      source_language: "ja",
      target_language: "vi",
      auto_translate: true,
      backlog_mapping_values_json: {
        status_directory: [
          { id: 1, name: "Open", display_order: 1 },
          { id: 2, name: "Closed", display_order: 2 },
        ],
        user_directory: [
          { id: 10, name: "Tanaka" },
          { id: 11, name: "Suzuki" },
        ],
      },
    },
  });
  createApprovedMapping(config, project.id, "issue_type", "Task", "task", "Task");
  createApprovedMapping(config, project.id, "status", "Open", "open", "To Do");
  createApprovedMapping(config, project.id, "priority", "Normal", "normal", "Medium");
  const secondProject = ProjectsApi.createProject({
    config,
    input: {
      name: "System Issues Two",
      enabled: true,
      sync_enabled: true,
      manual_pull_enabled: true,
      backlog_space_url: "https://example.backlog.com",
      backlog_project_key: "WEC",
      backlog_issue_key_prefix: "WEC",
      backlog_api_key_env: "BACKLOG_API_KEY_WEC",
      jira_project_key: "WEC",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_TOKEN",
      translation_provider: "codex_exec"
    }
  });
  await runConcurrentUpsert(config, project.id, "WEC-RACE");
  const raceDb = createConnection({ config });
  assert.equal(raceDb.prepare("SELECT COUNT(*) AS total FROM issues WHERE project_id = ? AND backlog_issue_key = 'WEC-RACE'").get(project.id).total, 1);
  const raceIssue = raceDb.prepare("SELECT id FROM issues WHERE project_id = ? AND backlog_issue_key = 'WEC-RACE'").get(project.id);
  assert.equal(raceDb.prepare("SELECT COUNT(*) AS total FROM issue_revisions WHERE issue_id = ?").get(raceIssue.id).total, 1);
  raceDb.close();

  await withServer(createApp({ config }), async (server) => {
    const login = await requestJson(server, { method: "POST", pathname: "/api/v1/auth/login", body: { email: "system-issues@example.test", password: "verify-password" } });
    const token = login.body.data.token;
    const call = (options) => requestJson(server, { token, ...options });
    const legacyIssues = await call({ pathname: ["", "api", "v1", "issues"].join("/") });
    assert.equal(legacyIssues.status, 404);

    const legacyFilterOptions = await call({ pathname: `/api/v1/projects/${secondProject.id}/backlog/issues/filter-options` });
    assert.equal(legacyFilterOptions.status, 200);
    assert.deepEqual(legacyFilterOptions.body.data.statuses, []);
    assert.deepEqual(legacyFilterOptions.body.data.assignees, []);
    const refreshedLegacyFilters = await call({
      method: "POST",
      pathname: `/api/v1/projects/${secondProject.id}/backlog/mapping-values/pull`,
    });
    assert.equal(refreshedLegacyFilters.status, 200);
    const refreshedFilterOptions = await call({ pathname: `/api/v1/projects/${secondProject.id}/backlog/issues/filter-options` });
    assert.equal(refreshedFilterOptions.status, 200);
    assert.deepEqual(refreshedFilterOptions.body.data.statuses.map((status) => status.id).sort(), [1, 2]);
    assert.deepEqual(refreshedFilterOptions.body.data.assignees.map((assignee) => assignee.id).sort(), [10, 11]);

    const readiness = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/action-readiness` });
    assert.equal(readiness.status, 200);
    assert.equal(readiness.body.data.actions.pull_one.execution_mode, "inline");
    assert.equal(readiness.body.data.actions.pull_project.enabled, false);
    assert.equal(readiness.body.data.actions.pull_project.execution_mode, "disabled");
    assert.deepEqual(readiness.body.data.actions.pull_project.disabled_reasons, ["PROJECT_PULL_DISABLED"]);
    assert.equal(readiness.body.data.actions.sync_to_cis.enabled, true);
    config.worker.enabled = false;
    const workerOff = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/action-readiness` });
    assert.equal(workerOff.body.data.actions.pull_one.execution_mode, "inline");
    assert.deepEqual(workerOff.body.data.actions.pull_project.disabled_reasons, ["PROJECT_PULL_DISABLED"]);
    assert.deepEqual(workerOff.body.data.actions.sync_to_cis.disabled_reasons, ["SYNC_WORKER_UNAVAILABLE"]);
    assert.equal(workerOff.body.data.actions.sync_to_cis.execution_mode, "disabled");
    assert.equal(workerOff.body.data.actions.sync_to_cis.consumer_ready, false);
    config.worker.enabled = true;

    const beforeReadOnlyBacklogCalls = ["issues", "issue_revisions", "sync_jobs", "sync_journal", "webhook_events", "pull_state"]
      .map((table) => [table, tableCount(config, table)]);
    const filterOptions = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/filter-options` });
    assert.equal(filterOptions.status, 200);
    assert.deepEqual(filterOptions.body.data.statuses.map((status) => status.name), ["Open", "Closed"]);
    assert.deepEqual(filterOptions.body.data.assignees.map((assignee) => assignee.name), ["Suzuki", "Tanaka"]);
    for (const [table, count] of beforeReadOnlyBacklogCalls) assert.equal(tableCount(config, table), count, `filter options mutated ${table}`);

    const browse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-29&created_to=2026-06-29&limit=2` });
    assert.equal(browse.status, 200);
    assert.deepEqual(browse.body.data.candidates.map((item) => item.backlog_issue_key), ["WEC-1", "WEC-2"]);
    assert.deepEqual(browse.body.data.candidates[0].assignee, { id: 10, name: "Tanaka" });
    for (const [table, count] of beforeReadOnlyBacklogCalls) assert.equal(tableCount(config, table), count, `browse mutated ${table}`);
    const notClosedBrowse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-29&created_to=2026-06-29&limit=2&not_closed=true` });
    assert.equal(notClosedBrowse.status, 200);
    assert.deepEqual(notClosedBrowse.body.data.candidates.map((item) => item.backlog_issue_key), ["WEC-1", "WEC-2"]);
    assert.equal(notClosedBrowse.body.data.filters.not_closed, true);
    const filteredBrowse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-30&created_to=2026-06-30&limit=2&status_id=2&assignee_id=11` });
    assert.equal(filteredBrowse.status, 200);
    assert.deepEqual(filteredBrowse.body.data.candidates.map((item) => item.backlog_issue_key), ["WEC-3"]);
    assert.deepEqual(filteredBrowse.body.data.filters.status_ids, [2]);
    assert.deepEqual(filteredBrowse.body.data.filters.assignee_ids, [11]);
    const invalidDate = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-02-31&created_to=2026-03-01&limit=2` });
    assert.equal(invalidDate.status, 422);
    const invalidAssignee = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-29&created_to=2026-06-29&limit=2&assignee_id=zero` });
    assert.equal(invalidAssignee.status, 422);
    const combinedStatusFilter = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-29&created_to=2026-06-29&limit=2&not_closed=true&status_id=1` });
    assert.equal(combinedStatusFilter.status, 200);
    assert.deepEqual(combinedStatusFilter.body.data.candidates.map((item) => item.backlog_issue_key), ["WEC-1", "WEC-2"]);

    const issueCountBeforeRollback = tableCount(config, "issues");
    assert.throws(() => CisApi.createManualIssue({ config, input: { project_id: project.id, summary: "Rollback create" }, executedBy: 999999 }));
    assert.equal(tableCount(config, "issues"), issueCountBeforeRollback, "journal failure must rollback manual create");

    const createdA = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/issues`, body: { summary: "Manual A", description: "Created in CIS" } });
    assert.equal(createdA.status, 201);
    assert.equal(createdA.body.data.issue.source_system, "manual");
    assert.equal(createdA.body.data.issue.current_revision, 1);
    const issueA = createdA.body.data.issue;
    const linkBacklog = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/issues/${issueA.id}/external-identities`, body: { backlog_issue_key: "wec-1" } });
    assert.equal(linkBacklog.status, 200);
    assert.equal(linkBacklog.body.data.external_identities.backlog.key, "WEC-1");

    const createdB = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/issues`, body: { summary: "Manual B" } });
    const issueB = createdB.body.data.issue;
    const linkJira = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/issues/${issueB.id}/external-identities`, body: { jira_issue_key: "wec-1" } });
    assert.equal(linkJira.status, 200, "same text in Backlog and Jira columns must be allowed");

    const createdC = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/issues`, body: { summary: "Manual C" } });
    const duplicateJira = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/issues/${createdC.body.data.issue.id}/external-identities`, body: { jira_issue_key: "WEC-1" } });
    assert.equal(duplicateJira.status, 409);
    assert.equal(duplicateJira.body.error.code, "EXTERNAL_LINK_DUPLICATE");
    const duplicateBacklog = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/issues/${createdC.body.data.issue.id}/external-identities`, body: { backlog_issue_key: "WEC-1" } });
    assert.equal(duplicateBacklog.status, 409);
    assert.equal(duplicateBacklog.body.error.code, "EXTERNAL_LINK_DUPLICATE");

    const secondProjectIssue = await call({ method: "POST", pathname: `/api/v1/projects/${secondProject.id}/issues`, body: { summary: "Other project" } });
    const firstProjectIssues = await call({ pathname: `/api/v1/projects/${project.id}/issues` });
    assert.equal(firstProjectIssues.status, 200);
    assert.equal(firstProjectIssues.body.data.items.some((issue) => issue.id === secondProjectIssue.body.data.issue.id), false);
    const secondProjectIssues = await call({ pathname: `/api/v1/projects/${secondProject.id}/issues` });
    assert.equal(secondProjectIssues.status, 200);
    assert.equal(secondProjectIssues.body.data.items.some((issue) => issue.id === secondProjectIssue.body.data.issue.id), true);
    const crossProjectRead = await call({ pathname: `/api/v1/projects/${project.id}/issues/${secondProjectIssue.body.data.issue.id}` });
    assert.equal(crossProjectRead.status, 404);
    assert.equal(crossProjectRead.body.error.code, "RESOURCE_NOT_FOUND");
    const crossProjectMutation = await call({ method: "PATCH", pathname: `/api/v1/projects/${project.id}/issues/${secondProjectIssue.body.data.issue.id}`, body: { summary: "Must not cross projects" } });
    assert.equal(crossProjectMutation.status, 404);
    assert.equal(CisApi.getIssueById({ config, issueId: secondProjectIssue.body.data.issue.id }).fields_json.summary.cis, "Other project");
    const otherProjectLinks = await call({
      method: "POST",
      pathname: `/api/v1/projects/${secondProject.id}/issues/${secondProjectIssue.body.data.issue.id}/external-identities`,
      body: { backlog_issue_key: "1001", jira_issue_key: "10019" },
    });
    assert.equal(otherProjectLinks.status, 200, "same identities in another CIS project must be allowed");
    assert.equal(otherProjectLinks.body.data.external_identities.backlog.key, "WEC-1");
    assert.equal(otherProjectLinks.body.data.external_identities.jira.key, "WEC-1");
    const rollbackLinkIssue = CisApi.createManualIssue({ config, input: { project_id: secondProject.id, summary: "Rollback link" } }).issue;
    await assert.rejects(() => CisApi.linkExternalIdentities({
      config,
      issueId: rollbackLinkIssue.id,
      input: { backlog_issue_key: "WEC-2" },
      executedBy: 999999,
    }));
    assert.equal(CisApi.getIssueById({ config, issueId: rollbackLinkIssue.id }).backlog_issue_key, null, "journal failure must rollback identity link");

    const afterLinkBrowse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-29&created_to=2026-06-29&limit=2` });
    assert.deepEqual(afterLinkBrowse.body.data.candidates.map((item) => item.backlog_issue_key), ["WEC-2"]);

    const queued = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-2/sync-to-cis` });
    assert.equal(queued.status, 202);
    assert.equal(queued.body.data.outcome, "queued");
    const activeBrowse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-29&created_to=2026-06-29&limit=2` });
    const activeCandidate = activeBrowse.body.data.candidates.find((item) => item.backlog_issue_key === "WEC-2");
    assert.equal(activeCandidate.active_job.id, queued.body.data.job.id);
    assert.equal(activeCandidate.active_job.status, "pending");
    assert.equal(activeCandidate.active_job.with_translation, false);
    const reused = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-2/sync-to-cis` });
    assert.equal(reused.body.data.job.id, queued.body.data.job.id);
    const worked = await SyncApi.runWorkerOnce({ config, workerId: "system-issues-worker" });
    assert.equal(worked.job.status, "success");
    assert.ok(CisApi.getIssueByBacklogKey({ config, projectId: project.id, backlogIssueKey: "WEC-2" }));

    const deferredProviderVerification = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-404/sync-to-cis` });
    assert.equal(deferredProviderVerification.status, 202, "candidate request must enqueue before provider verification");
    const providerVerificationFailure = await SyncApi.runJobNow({
      config,
      jobId: deferredProviderVerification.body.data.job.id,
      workerId: "system-issues-provider-verification",
    });
    assert.equal(providerVerificationFailure.job.status, "failed");
    assert.equal(providerVerificationFailure.error.code, "BACKLOG_ISSUE_NOT_FOUND");

    const invalidTranslationFlag = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-3/sync-to-cis`,
      body: { with_translation: "true" },
    });
    assert.equal(invalidTranslationFlag.status, 422);
    assert.equal(invalidTranslationFlag.body.error.code, "VALIDATION_ERROR");
    const invalidJiraFlag = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-3/sync-to-cis`,
      body: { push_to_jira: "true" },
    });
    assert.equal(invalidJiraFlag.status, 422);
    assert.equal(invalidJiraFlag.body.error.code, "VALIDATION_ERROR");

    const legacyBeforePromotion = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-3/sync-to-cis`,
    });
    assert.equal(legacyBeforePromotion.status, 202);
    const promoted = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-3/sync-to-cis`,
      body: { with_translation: true },
    });
    assert.equal(promoted.status, 202);
    assert.equal(promoted.body.data.job.id, legacyBeforePromotion.body.data.job.id);
    assert.equal(promoted.body.data.promoted, true);
    assert.equal(promoted.body.data.job.payload_json.with_translation, true);
    const promotedBrowse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-30&created_to=2026-06-30&limit=2` });
    const promotedCandidate = promotedBrowse.body.data.candidates.find((item) => item.backlog_issue_key === "WEC-3");
    assert.equal(promotedCandidate.active_job.id, promoted.body.data.job.id);
    assert.equal(promotedCandidate.active_job.with_translation, true);

    const translatedParent = await SyncApi.runWorkerOnce({ config, workerId: "system-issues-translation-parent" });
    assert.equal(translatedParent.job.id, promoted.body.data.job.id);
    assert.equal(translatedParent.job.status, "success");
    const translatedIssue = CisApi.getIssueByBacklogKey({ config, projectId: project.id, backlogIssueKey: "WEC-3" });
    assert.ok(translatedIssue);
    const translationDb = createConnection({ config });
    const translationItems = translationDb
      .prepare("SELECT * FROM translation_queue WHERE issue_id = ? ORDER BY target_field")
      .all(translatedIssue.id);
    assert.deepEqual(translationItems.map((item) => item.target_field), ["description", "summary"]);
    assert.equal(translationDb.prepare(
      "SELECT COUNT(*) AS total FROM sync_jobs WHERE job_type = 'translate' AND status IN ('pending', 'running') AND json_extract(payload_json, '$.parent_sync_job_id') = ?"
    ).get(promoted.body.data.job.id).total, 2);
    assert.equal(translationDb.prepare(
      "SELECT COUNT(*) AS total FROM sync_jobs WHERE job_type = 'translate' AND status IN ('pending', 'running') AND json_extract(payload_json, '$.translation_queue_id') IN (?, ?)"
    ).get(translationItems[0].id, translationItems[1].id).total, 2);
    translationDb.close();

    const jiraWorkflowBase = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-4/sync-to-cis`,
    });
    const jiraWorkflow = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-4/sync-to-cis`,
      body: { with_translation: true, push_to_jira: true },
    });
    assert.equal(jiraWorkflow.status, 202);
    assert.equal(jiraWorkflow.body.data.job.id, jiraWorkflowBase.body.data.job.id);
    assert.equal(jiraWorkflow.body.data.promoted, true);
    assert.equal(jiraWorkflow.body.data.job.payload_json.with_translation, true);
    assert.equal(jiraWorkflow.body.data.job.payload_json.push_to_jira, true);
    assert.equal(jiraWorkflow.body.data.job.job_type, "sync_translate_jira");
    assert.equal(jiraWorkflow.body.data.job.direction_to, "jira");
    assert.equal(jiraWorkflow.body.data.job.max_attempts, 5);
    const jiraActiveBrowse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-07-01&created_to=2026-07-01&limit=2` });
    const jiraActiveCandidate = jiraActiveBrowse.body.data.candidates.find((item) => item.backlog_issue_key === "WEC-4");
    assert.equal(jiraActiveCandidate.active_job.id, jiraWorkflow.body.data.job.id);
    assert.equal(jiraActiveCandidate.active_job.push_to_jira, true);

    const jiraWorkflowRun = await SyncApi.runJobNow({
      config,
      jobId: jiraWorkflow.body.data.job.id,
      workerId: "system-issues-jira-workflow",
    });
    assert.equal(jiraWorkflowRun.job.status, "success", jiraWorkflowRun.error && jiraWorkflowRun.error.message);
    const jiraIssue = CisApi.getIssueByBacklogKey({ config, projectId: project.id, backlogIssueKey: "WEC-4" });
    assert.ok(jiraIssue.jira_issue_key);
    const jiraEditor = CisApi.getIssueEditor({ config, issueId: jiraIssue.id });
    assert.match(jiraEditor.canonical.summary.value, /^【WEC-4】\[vi\]/);
    assert.match(jiraEditor.canonical.description.value, /^\[vi\]/);
    assert.deepEqual(jiraEditor.translations.map((item) => item.review_status), ["approved", "approved"]);
    const workflowJournal = SyncApi.listJournal({ config, filters: { issue_id: jiraIssue.id } });
    assert.ok(workflowJournal.some((entry) => entry.action === "translation_batch_auto_approved"));
    assert.ok(workflowJournal.some((entry) => entry.job_type === "dry_run" && entry.details_json.can_sync === true));
    assert.ok(workflowJournal.some((entry) => ["create", "update"].includes(entry.action) && entry.direction_to === "jira"));
    const jiraCompletedBrowse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-07-01&created_to=2026-07-01&limit=2` });
    assert.equal(jiraCompletedBrowse.body.data.candidates.some((item) => item.backlog_issue_key === "WEC-4"), false);

    const failedBatchRequest = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-5/sync-to-cis`,
      body: { with_translation: true, push_to_jira: true },
    });
    const originalTranslateHandler = TranslationApi.translateQueueItemNow;
    TranslationApi.translateQueueItemNow = async (input) => {
      const item = TranslationApi.getTranslationQueueItem({ config, queueId: input.queueId, projectId: project.id });
      if (item && item.target_field === "description") {
        const error = new Error("Forced translation element failure.");
        error.code = "VERIFY_TRANSLATION_ELEMENT_FAILED";
        error.retryable = false;
        throw error;
      }
      return originalTranslateHandler(input);
    };
    let failedBatchRun;
    try {
      failedBatchRun = await SyncApi.runJobNow({
        config,
        jobId: failedBatchRequest.body.data.job.id,
        workerId: "system-issues-failed-translation-batch",
      });
    } finally {
      TranslationApi.translateQueueItemNow = originalTranslateHandler;
    }
    assert.equal(failedBatchRun.job.status, "failed");
    assert.equal(failedBatchRun.error.code, "VERIFY_TRANSLATION_ELEMENT_FAILED");
    const failedBatchIssue = CisApi.getIssueByBacklogKey({ config, projectId: project.id, backlogIssueKey: "WEC-5" });
    assert.equal(failedBatchIssue.jira_issue_key, null);
    const failedBatchEditor = CisApi.getIssueEditor({ config, issueId: failedBatchIssue.id });
    assert.equal(failedBatchEditor.canonical.summary.value, "Atomic rollback candidate");
    assert.equal(failedBatchEditor.canonical.description.value, "The second translation element must fail without partial canonical apply.");
    assert.equal(SyncApi.listJobs({ config, filters: { project_id: project.id } }).some((job) => job.issue_id === failedBatchIssue.id && job.job_type === "push_issue"), false);

    const runningLegacy = await call({
      method: "POST",
      pathname: `/api/v1/projects/${secondProject.id}/backlog/issues/WEC-2/sync-to-cis`,
    });
    const runningJob = createSyncJobRepository({ config }).lockById({
      jobId: runningLegacy.body.data.job.id,
      workerId: "system-issues-running",
    });
    assert.equal(runningJob.status, "running");
    const runningConflict = await call({
      method: "POST",
      pathname: `/api/v1/projects/${secondProject.id}/backlog/issues/WEC-2/sync-to-cis`,
      body: { with_translation: true },
    });
    assert.equal(runningConflict.status, 409);
    assert.equal(runningConflict.body.error.code, "BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION");
    assert.equal(runningConflict.body.error.details.job_id, runningJob.id);
    assert.equal(runningConflict.body.error.details.status, "running");
    const runningJiraConflict = await call({
      method: "POST",
      pathname: `/api/v1/projects/${secondProject.id}/backlog/issues/WEC-2/sync-to-cis`,
      body: { with_translation: true, push_to_jira: true },
    });
    assert.equal(runningJiraConflict.status, 409);
    assert.equal(runningJiraConflict.body.error.code, "BACKLOG_SYNC_RUNNING_WITHOUT_JIRA");
    createSyncJobRepository({ config }).markFailed(runningJob.id, new Error("verification cleanup"), { retryable: false });

    const transientRequest = await call({
      method: "POST",
      pathname: `/api/v1/projects/${secondProject.id}/backlog/issues/WEC-2/sync-to-cis`,
      body: { with_translation: true },
    });
    const transientJobId = transientRequest.body.data.job.id;
    const originalTranslateEnqueue = SyncApi.enqueueTranslateJobIfNoneActive;
    SyncApi.enqueueTranslateJobIfNoneActive = () => {
      const error = new Error("database is busy");
      error.code = "SQLITE_BUSY";
      throw error;
    };
    try {
      const transientRun = await SyncApi.runJobNow({ config, jobId: transientJobId, workerId: "system-issues-transient" });
      assert.equal(transientRun.job.status, "pending");
      assert.equal(transientRun.error.code, "SQLITE_BUSY");
      assert.equal(transientRun.error.retryable, true);
    } finally {
      SyncApi.enqueueTranslateJobIfNoneActive = originalTranslateEnqueue;
    }
    const transientDb = createConnection({ config });
    transientDb.prepare("UPDATE sync_jobs SET run_after = datetime('now') WHERE id = ?").run(transientJobId);
    transientDb.close();
    const recoveredTransient = await SyncApi.runJobNow({ config, jobId: transientJobId, workerId: "system-issues-transient-retry" });
    assert.equal(recoveredTransient.job.status, "success");

    const duplicateTranslation = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-3/sync-to-cis`,
      body: { with_translation: true },
    });
    assert.equal(duplicateTranslation.body.data.outcome, "already_in_cis");

    const guardedIssue = CisApi.createManualIssue({ config, input: { project_id: project.id, summary: "Push guard" } }).issue;
    const pushInput = {
      project_id: project.id,
      issue_id: guardedIssue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "push_issue",
      payload_json: { canonical_hash: "verify-hash" },
      trigger: "manual",
    };
    const firstPush = SyncApi.enqueueIssueJobIfNoneActive({ config, input: pushInput });
    const secondPush = SyncApi.enqueueIssueJobIfNoneActive({ config, input: pushInput });
    assert.equal(firstPush.reused, false);
    assert.equal(secondPush.reused, true);
    assert.equal(secondPush.job.id, firstPush.job.id);
    const blockedEdit = await call({ method: "PATCH", pathname: `/api/v1/projects/${project.id}/issues/${guardedIssue.id}`, body: { summary: "Must not save" } });
    assert.equal(blockedEdit.status, 409);
    assert.equal(blockedEdit.body.error.code, "ISSUE_SYNC_IN_PROGRESS");

    const journal = SyncApi.listJournal({ config, filters: { issue_id: issueA.id } });
    assert.ok(journal.some((entry) => entry.action === "issue_manual_created"));
    assert.ok(journal.some((entry) => entry.action === "issue_external_identity_linked"));
  });
  console.log("System issues verification passed.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
