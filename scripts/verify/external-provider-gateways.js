const assert = require("assert");
const path = require("path");

const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const { assertScopeOperation, createExternalAccessScope } = require("../../src/infrastructure/external/core/createExternalAccessScope");
const { BACKLOG_OPERATIONS } = require("../../src/infrastructure/external/providers/backlog/operations");
const { JIRA_OPERATIONS } = require("../../src/infrastructure/external/providers/jira/operations");
const BacklogApi = require("../../src/modules/Backlog/BacklogApi");
const { createBacklogClient } = require("../../src/modules/Backlog/infrastructure/BacklogClient");
const { createJiraClient } = require("../../src/modules/Jira/infrastructure/JiraClient");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const { makeTempConfig } = require("./helpers/tempConfig");

async function rejectsCode(callback, code) {
  await assert.rejects(callback, (error) => error.code === code && error.retryable === false);
}

async function main() {
  const config = makeTempConfig("external-provider-gateways", {
    BACKLOG_FAKE_FIXTURE_PATH: path.resolve(__dirname, "fixtures/backlog-issue.json"),
    JIRA_FAKE_MODE: "1",
    WORKER_ENABLED: "true",
  });
  ensureStorage(config.storage);
  migrate({ config });

  const defaults = ProjectsApi.createProject({ config, input: { name: "Gate defaults" } });
  assert.equal(defaults.backlog_external_read_enabled, true);
  assert.equal(defaults.jira_external_read_enabled, true);
  assert.equal(defaults.jira_external_write_enabled, false);

  assert.throws(() => ProjectsApi.createProject({
    config,
    input: { name: "Bad URL", backlog_space_url: "http://backlog.example.test/path" },
  }), (error) => error.code === "VALIDATION_ERROR" && error.details.field === "backlog_space_url");

  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Guarded Project",
      enabled: true,
      sync_enabled: true,
      manual_pull_enabled: true,
      backlog_external_read_enabled: true,
      jira_external_read_enabled: true,
      jira_external_write_enabled: true,
      backlog_project_key: "WEC",
      backlog_issue_key_prefix: "WEC",
      jira_project_key: "JRA",
    },
  });
  const other = ProjectsApi.createProject({ config, input: { name: "Other Project" } });

  const backlogClient = createBacklogClient({ config, projectId: project.id });
  assert.equal((await backlogClient.getIssue("WEC-1")).issueKey, "WEC-1");

  await rejectsCode(
    async () => createBacklogClient({ config, projectId: project.id, externalAccessScope: {} }).getIssue("WEC-1"),
    "EXTERNAL_SCOPE_INVALID"
  );
  const otherScope = createExternalAccessScope({ config, projectId: other.id });
  await rejectsCode(
    async () => createBacklogClient({ config, projectId: project.id, externalAccessScope: otherScope }).getIssue("WEC-1"),
    "EXTERNAL_SCOPE_PROJECT_MISMATCH"
  );
  await rejectsCode(
    async () => assertScopeOperation(otherScope, other.id, "backlog", "backlog.issue.delete"),
    "EXTERNAL_OPERATION_NOT_REGISTERED"
  );

  ProjectsApi.updateProject({ config, projectId: project.id, input: { jira_external_write_enabled: false } });
  await rejectsCode(
    async () => createJiraClient({ config, projectId: project.id }).createIssue({ fields: { summary: "blocked" } }),
    "EXTERNAL_GATE_BLOCKED"
  );

  ProjectsApi.updateProject({ config, projectId: project.id, input: { backlog_external_read_enabled: false } });
  const before = SyncApi.listJobs({ config, filters: { project_id: project.id } }).length;
  await rejectsCode(
    () => BacklogApi.syncCandidateToCis({ config, projectId: project.id, backlogIssueKey: "WEC-1" }),
    "EXTERNAL_GATE_BLOCKED"
  );
  assert.equal(SyncApi.listJobs({ config, filters: { project_id: project.id } }).length, before);

  ProjectsApi.updateProject({ config, projectId: project.id, input: { backlog_external_read_enabled: true } });
  const job = SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      payload_json: { backlog_issue_key: "WEC-1" },
    },
  });
  ProjectsApi.updateProject({ config, projectId: project.id, input: { backlog_external_read_enabled: false } });
  const execution = await SyncApi.runWorkerOnce({ config, workerId: "external-gate-verifier" });
  assert.equal(execution.job.id, job.id);
  assert.equal(execution.job.status, "failed");
  assert.equal(execution.job.last_error_code, "EXTERNAL_GATE_BLOCKED");
  const reloaded = SyncApi.getJob({ config, jobId: job.id });
  assert.equal(reloaded.last_error_code, "EXTERNAL_GATE_BLOCKED");
  assert.equal(reloaded.last_error_details.provider, "backlog");
  assert.equal(reloaded.last_error_details.retryable, false);

  assert.equal(BACKLOG_OPERATIONS["backlog.issue.get"].method, "GET");
  assert.equal(BACKLOG_OPERATIONS["backlog.issues.count"].method, "GET");
  assert.equal(Object.keys(BACKLOG_OPERATIONS).length, 12);
  assert.equal(BACKLOG_OPERATIONS["backlog.issue.get"].path({ issueKey: "A/../?B" }), "/api/v2/issues/A%2F..%2F%3FB");
  assert.equal(JIRA_OPERATIONS["jira.issue.create"].method, "POST");
  assert.equal(Object.keys(JIRA_OPERATIONS).length, 15);
  assert.equal(JIRA_OPERATIONS["jira.issue.update"].method, "PUT");
  assert.equal(JIRA_OPERATIONS["jira.issue.create"].capability, "jira_external_write_enabled");

  console.log("External provider gateway verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
