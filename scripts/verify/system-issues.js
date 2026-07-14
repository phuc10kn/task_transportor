const assert = require("assert");
const { execFile, execFileSync } = require("child_process");
const path = require("path");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function tableCount(config, table) {
  const db = createConnection({ config });
  try { return db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total; }
  finally { db.close(); }
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
    BACKLOG_FAKE_FIXTURE_PATH: path.join(__dirname, "fixtures", "backlog-issue.json"),
    JIRA_FAKE_MODE: "1",
    JIRA_FAKE_SEED_PATH: path.join(__dirname, "fixtures", "jira-system-issues.json"),
    WORKER_ENABLED: "true",
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
      jira_project_key: "WEC",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_TOKEN",
      translation_provider: "codex_exec",
    },
  });
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

    const readiness = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/action-readiness` });
    assert.equal(readiness.status, 200);
    assert.equal(readiness.body.data.actions.pull_one.execution_mode, "inline");
    assert.equal(readiness.body.data.actions.pull_project.execution_mode, "queued_ready");
    assert.equal(readiness.body.data.actions.sync_to_cis.enabled, true);
    config.worker.enabled = false;
    const workerOff = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/action-readiness` });
    assert.equal(workerOff.body.data.actions.pull_one.execution_mode, "inline");
    assert.equal(workerOff.body.data.actions.pull_project.execution_mode, "queued_waiting");
    assert.deepEqual(workerOff.body.data.actions.sync_to_cis.disabled_reasons, ["SYNC_WORKER_UNAVAILABLE"]);
    assert.equal(workerOff.body.data.actions.sync_to_cis.execution_mode, "disabled");
    assert.equal(workerOff.body.data.actions.sync_to_cis.consumer_ready, false);
    config.worker.enabled = true;

    const beforeBrowse = ["issues", "issue_revisions", "sync_jobs", "sync_journal", "webhook_events", "pull_state"]
      .map((table) => [table, tableCount(config, table)]);
    const browse = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-06-29&created_to=2026-06-29&limit=2` });
    assert.equal(browse.status, 200);
    assert.deepEqual(browse.body.data.candidates.map((item) => item.backlog_issue_key), ["WEC-1", "WEC-2"]);
    for (const [table, count] of beforeBrowse) assert.equal(tableCount(config, table), count, `browse mutated ${table}`);
    const invalidDate = await call({ pathname: `/api/v1/projects/${project.id}/backlog/issues/candidates?created_from=2026-02-31&created_to=2026-03-01&limit=2` });
    assert.equal(invalidDate.status, 422);

    const issueCountBeforeRollback = tableCount(config, "issues");
    assert.throws(() => CisApi.createManualIssue({ config, input: { project_id: project.id, summary: "Rollback create" }, executedBy: 999999 }));
    assert.equal(tableCount(config, "issues"), issueCountBeforeRollback, "journal failure must rollback manual create");

    const createdA = await call({ method: "POST", pathname: "/api/v1/issues", body: { project_id: project.id, summary: "Manual A", description: "Created in CIS" } });
    assert.equal(createdA.status, 201);
    assert.equal(createdA.body.data.issue.source_system, "manual");
    assert.equal(createdA.body.data.issue.current_revision, 1);
    const issueA = createdA.body.data.issue;
    const linkBacklog = await call({ method: "POST", pathname: `/api/v1/issues/${issueA.id}/external-identities`, body: { backlog_issue_key: "wec-1" } });
    assert.equal(linkBacklog.status, 200);
    assert.equal(linkBacklog.body.data.external_identities.backlog.key, "WEC-1");

    const createdB = await call({ method: "POST", pathname: "/api/v1/issues", body: { project_id: project.id, summary: "Manual B" } });
    const issueB = createdB.body.data.issue;
    const linkJira = await call({ method: "POST", pathname: `/api/v1/issues/${issueB.id}/external-identities`, body: { jira_issue_key: "wec-1" } });
    assert.equal(linkJira.status, 200, "same text in Backlog and Jira columns must be allowed");

    const createdC = await call({ method: "POST", pathname: "/api/v1/issues", body: { project_id: project.id, summary: "Manual C" } });
    const duplicateJira = await call({ method: "POST", pathname: `/api/v1/issues/${createdC.body.data.issue.id}/external-identities`, body: { jira_issue_key: "WEC-1" } });
    assert.equal(duplicateJira.status, 409);
    assert.equal(duplicateJira.body.error.code, "EXTERNAL_LINK_DUPLICATE");
    const duplicateBacklog = await call({ method: "POST", pathname: `/api/v1/issues/${createdC.body.data.issue.id}/external-identities`, body: { backlog_issue_key: "WEC-1" } });
    assert.equal(duplicateBacklog.status, 409);
    assert.equal(duplicateBacklog.body.error.code, "EXTERNAL_LINK_DUPLICATE");

    const secondProjectIssue = await call({ method: "POST", pathname: "/api/v1/issues", body: { project_id: secondProject.id, summary: "Other project" } });
    const otherProjectLinks = await call({
      method: "POST",
      pathname: `/api/v1/issues/${secondProjectIssue.body.data.issue.id}/external-identities`,
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
    const reused = await call({ method: "POST", pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-2/sync-to-cis` });
    assert.equal(reused.body.data.job.id, queued.body.data.job.id);
    const worked = await SyncApi.runWorkerOnce({ config, workerId: "system-issues-worker" });
    assert.equal(worked.job.status, "success");
    assert.ok(CisApi.getIssueByBacklogKey({ config, projectId: project.id, backlogIssueKey: "WEC-2" }));

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
    const blockedEdit = await call({ method: "PATCH", pathname: `/api/v1/issues/${guardedIssue.id}`, body: { summary: "Must not save" } });
    assert.equal(blockedEdit.status, 409);
    assert.equal(blockedEdit.body.error.code, "ISSUE_SYNC_IN_PROGRESS");

    const journal = SyncApi.listJournal({ config, filters: { issue_id: issueA.id } });
    assert.ok(journal.some((entry) => entry.action === "issue_manual_created"));
    assert.ok(journal.some((entry) => entry.action === "issue_external_identity_linked"));
  });
  console.log("System issues verification passed.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
