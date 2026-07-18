const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const BacklogApi = require("../../src/modules/Backlog/BacklogApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const MappingApi = require("../../src/modules/Mapping/MappingApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function createBacklogProject(config, overrides = {}) {
  return ProjectsApi.createProject({
    config,
    input: {
      name: "Backlog Ingestion Project",
      enabled: true,
      sync_enabled: true,
      backlog_space_url: "https://example.backlog.com",
      backlog_project_key: "WEC",
      backlog_issue_key_prefix: "WEC",
      backlog_api_key_env: "BACKLOG_API_KEY_WEC",
      jira_project_key: "SYNC",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_API_TOKEN",
      translation_provider: "deepseek",
      manual_pull_enabled: true,
      scheduled_pull_enabled: true,
      scheduled_pull_interval_minutes: 15,
      pull_updated_since_window_minutes: 30,
      ...overrides,
    },
  });
}

function countRows(config, sql, ...params) {
  const db = createConnection({ config });
  try {
    return db.prepare(sql).get(...params).total;
  } finally {
    db.close();
  }
}

async function main() {
  const fixturePath = path.resolve(__dirname, "fixtures/backlog-issue.json");
  const config = makeTempConfig("backlog-ingestion", {
    ADMIN_EMAIL: "admin@example.test",
    ADMIN_PASSWORD: "correct-horse-battery",
    BACKLOG_FAKE_FIXTURE_PATH: fixturePath,
  });

  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({
    config,
    email: "admin@example.test",
    password: "correct-horse-battery",
  });

  const project = createBacklogProject(config);
  const issueTypeMapping = MappingApi.createMappingRule({
    config,
    input: {
      project_id: project.id,
      mapping_type: "issue_type",
      direction_from: "backlog",
      direction_to: "cis",
      from_value: "Bug",
      to_value: "bug",
    },
  });
  MappingApi.approveMappingRule({ config, ruleId: issueTypeMapping.id, approvedBy: 1 });
  const app = createApp({ config });

  await withServer(app, async (server) => {
    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: {
        email: "admin@example.test",
        password: "correct-horse-battery",
      },
    });
    const token = login.body.data.token;

    const pullIssue = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-1/pull`,
      token,
    });
    assert.equal(pullIssue.status, 202);
    assert.equal(pullIssue.body.data.direction_from, "backlog");
    assert.equal(pullIssue.body.data.direction_to, "cis");
    assert.equal(pullIssue.body.data.job_type, "manual_pull");
    assert.equal(pullIssue.body.data.status, "success");

    const issue = CisApi.getIssueByBacklogKey({
      config,
      projectId: project.id,
      backlogIssueKey: "WEC-1",
    });
    assert.ok(issue.id);
    assert.equal(issue.backlog_issue_key, "WEC-1");
    assert.equal(issue.status, "ingested");
    assert.equal(issue.current_revision, 1);
    assert.equal(issue.fields_json.summary.backlog, "Login screen fails");
    assert.equal(issue.fields_json.issue_type.cis, "bug");
    const completedPullJob = SyncApi.getJob({
      config,
      jobId: pullIssue.body.data.id,
    });
    assert.equal(completedPullJob.issue_id, issue.id);
    assert.equal(completedPullJob.issue_reference, "WEC-1");

    const children = CisApi.listIssueChildren({ config, issueId: issue.id });
    assert.equal(children.revisions.length, 1);
    assert.equal(children.comments.length, 1);
    assert.equal(children.comments[0].backlog_comment_id, "501");
    assert.equal(children.attachments.length, 1);
    assert.equal(children.attachments[0].backlog_attachment_id, "701");
    assert.equal(children.attachments[0].original_filename, "login-error.png");
    assert.equal(children.attachments[0].download_status, "downloaded");
    assert.ok(children.attachments[0].stored_path);
    assert.match(children.attachments[0].sha256, /^[a-f0-9]{64}$/);
    assert.ok(fs.existsSync(path.join(config.storage.attachments, children.attachments[0].stored_path)));
    assert.equal(children.translations.length, 0);

    MappingApi.updateMappingRule({ config, ruleId: issueTypeMapping.id, input: { to_value: "defect" } });
    MappingApi.approveMappingRule({ config, ruleId: issueTypeMapping.id, approvedBy: 1 });
    const resync = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-1/pull`,
      token,
    });
    assert.equal(resync.status, 202);
    assert.equal(resync.body.data.status, "success");
    const remapped = CisApi.getIssueByBacklogKey({ config, projectId: project.id, backlogIssueKey: "WEC-1" });
    assert.equal(remapped.fields_json.issue_type.cis, "defect");
    assert.equal(remapped.current_revision, 1);

    CisApi.markAttachmentDownloadFailed({
      config,
      attachmentId: children.attachments[0].id,
      errorMessage: "Forced retry verification failure",
    });
    const otherProject = ProjectsApi.createProject({ config, input: { name: "Other attachment Project" } });
    const jobCountBeforeRetry = SyncApi.listJobs({ config, filters: {} }).length;
    const journalCountBeforeRetry = SyncApi.listJournal({ config, filters: {} }).length;
    const crossProjectRetry = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${otherProject.id}/attachments/${children.attachments[0].id}/retry-download`,
      token,
    });
    assert.equal(crossProjectRetry.status, 404);
    assert.equal(crossProjectRetry.body.error.code, "RESOURCE_NOT_FOUND");
    assert.equal(CisApi.getAttachmentById({ config, attachmentId: children.attachments[0].id }).download_status, "failed");
    assert.equal(SyncApi.listJournal({ config, filters: {} }).length, journalCountBeforeRetry);
    const legacyAttachmentRetry = await requestJson(server, {
      method: "POST",
      pathname: ["", "api", "v1", "attachments", children.attachments[0].id, "retry-download"].join("/"),
      token,
    });
    assert.equal(legacyAttachmentRetry.status, 404);
    const retryAttachment = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/attachments/${children.attachments[0].id}/retry-download`,
      token,
    });
    const jobCountAfterRetry = SyncApi.listJobs({ config, filters: {} }).length;
    assert.equal(retryAttachment.status, 200);
    assert.equal(retryAttachment.body.data.download_status, "downloaded");
    assert.ok(retryAttachment.body.data.stored_path);
    assert.match(retryAttachment.body.data.sha256, /^[a-f0-9]{64}$/);
    assert.equal(jobCountAfterRetry, jobCountBeforeRetry);

    const jobJournal = SyncApi.listJournal({
      config,
      filters: { sync_job_id: pullIssue.body.data.id },
    });
    assert.ok(jobJournal.some((entry) => entry.action === "backlog_issue_ingested"));
    assert.ok(jobJournal.some((entry) => entry.action === "job_enqueued" && entry.issue_id === issue.id));
    assert.ok(jobJournal.some((entry) => entry.action === "job_locked" && entry.issue_id === issue.id));
    assert.ok(jobJournal.some((entry) => entry.action === "job_success" && entry.issue_id === issue.id));

    const duplicatePull = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/issues/WEC-1/pull`,
      token,
    });
    assert.equal(duplicatePull.status, 202);
    assert.equal(duplicatePull.body.data.status, "success");

    const afterDuplicate = CisApi.listIssueChildren({ config, issueId: issue.id });
    assert.equal(afterDuplicate.revisions.length, 1);
    assert.equal(afterDuplicate.comments.length, 1);
    assert.equal(afterDuplicate.attachments.length, 1);
    assert.equal(afterDuplicate.translations.length, 0);

    const projectPull = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/pull`,
      token,
    });
    assert.equal(projectPull.status, 409);
    assert.equal(projectPull.body.error.code, "BACKLOG_PROJECT_PULL_DISABLED");
  });

  const scheduled = await BacklogApi.runScheduledPullScan({ config });
  assert.equal(scheduled.disabled, true);
  assert.equal(scheduled.reason, "BACKLOG_PROJECT_PULL_DISABLED");
  assert.equal(scheduled.scanned_projects, 0);
  assert.deepEqual(scheduled.results, []);

  const db = createConnection({ config });
  const pullState = db
    .prepare("SELECT * FROM pull_state WHERE project_id = ? AND source_system = 'backlog'")
    .get(project.id);
  db.close();
  assert.equal(pullState, undefined);

  const missingCredentialConfig = makeTempConfig("backlog-missing-credential");
  ensureStorage(missingCredentialConfig.storage);
  migrate({ config: missingCredentialConfig });
  const missingProject = createBacklogProject(missingCredentialConfig, {
    name: "Missing Credential Project",
    backlog_api_key: "",
  });
  const missingJob = SyncApi.enqueueJob({
    config: missingCredentialConfig,
    input: {
      project_id: missingProject.id,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      payload_json: {
        mode: "issue",
        backlog_issue_key: "WEC-1",
      },
      trigger: "manual",
    },
  });
  const missingResult = await SyncApi.runWorkerOnce({
    config: missingCredentialConfig,
    workerId: "backlog-missing-credential-worker",
  });
  assert.equal(missingResult.job.id, missingJob.id);
  assert.equal(missingResult.job.status, "failed");
  assert.equal(missingResult.job.last_error, "Backlog API key is not configured.");
  const failedJournalCount = countRows(
    missingCredentialConfig,
    "SELECT COUNT(*) AS total FROM sync_journal WHERE sync_job_id = ? AND status = 'failed'",
    missingJob.id
  );
  assert.equal(failedJournalCount, 1);

  const failedDownloadFixturePath = path.join(path.dirname(fixturePath), "backlog-issue-download-fail.json");
  const failedDownloadConfig = makeTempConfig("backlog-download-fail", {
    BACKLOG_FAKE_FIXTURE_PATH: failedDownloadFixturePath,
  });
  ensureStorage(failedDownloadConfig.storage);
  migrate({ config: failedDownloadConfig });
  const failedDownloadProject = createBacklogProject(failedDownloadConfig, {
    name: "Download Fail Project",
  });
  const failedDownloadJob = SyncApi.enqueueJob({
    config: failedDownloadConfig,
    input: {
      project_id: failedDownloadProject.id,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      payload_json: {
        mode: "issue",
        backlog_issue_key: "WEC-3",
      },
      trigger: "manual",
    },
  });
  const failedDownloadResult = await SyncApi.runWorkerOnce({
    config: failedDownloadConfig,
    workerId: "backlog-download-fail-worker",
  });
  assert.equal(failedDownloadResult.job.id, failedDownloadJob.id);
  assert.equal(failedDownloadResult.job.status, "success");
  const failedDownloadIssue = CisApi.getIssueByBacklogKey({
    config: failedDownloadConfig,
    projectId: failedDownloadProject.id,
    backlogIssueKey: "WEC-3",
  });
  const failedDownloadChildren = CisApi.listIssueChildren({
    config: failedDownloadConfig,
    issueId: failedDownloadIssue.id,
  });
  assert.equal(failedDownloadChildren.attachments.length, 1);
  assert.equal(failedDownloadChildren.attachments[0].download_status, "failed");
  assert.equal(failedDownloadChildren.attachments[0].error_message, "Fixture download failure");

  console.log("Backlog ingestion verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
