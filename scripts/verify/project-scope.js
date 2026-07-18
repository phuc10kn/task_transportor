const assert = require("assert");
const express = require("express");
const fs = require("fs");
const path = require("path");

const { errorHandler, notFoundHandler } = require("../../src/http/middleware/errorHandlers");
const { requireProjectWorkspace } = require("../../src/http/middleware/requireProjectWorkspace");
const { success } = require("../../src/http/response/envelope");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const { createSyncRouter } = require("../../src/modules/Sync/http/routes");
const { createDashboardRouter } = require("../../src/modules/Dashboard/http/routes");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { createSyncJobRepository } = require("../../src/modules/Sync/infrastructure/SyncJobRepository");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function createProject(config, creatorUserId, name, enabled = true) {
  return ProjectsApi.createProject({ config, creatorUserId, input: { name, enabled } });
}

function enqueue(config, projectId, key) {
  return SyncApi.enqueueJob({
    config,
    input: {
      project_id: projectId,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      payload_json: { backlog_issue_key: key },
    },
  });
}

function verifyStaticBoundaries() {
  const shared = fs.readFileSync(path.resolve(__dirname, "../../apps/admin-web/public/shared.js"), "utf8");
  const projectApiSource = shared.slice(shared.indexOf("function projectApi"), shared.indexOf("function state"));
  const pollJobSource = shared.slice(shared.indexOf("async function pollJob"), shared.indexOf("function setTheme"));
  const middleware = fs.readFileSync(path.resolve(__dirname, "../../src/http/middleware/requireProjectWorkspace.js"), "utf8");

  assert.match(projectApiSource, /function projectApi\(projectId, path, options/);
  assert.doesNotMatch(projectApiSource, /activeProjectId|sessionStorage/);
  assert.match(pollJobSource, /projectApi\(projectId,/);
  assert.doesNotMatch(pollJobSource, /\/api\/v1\/sync-jobs/);
  assert.match(middleware, /ProjectsApi\.getProject/);
  assert.doesNotMatch(middleware, /Repository|createConnection|sqlite/i);
}

async function main() {
  verifyStaticBoundaries();
  const config = makeTempConfig("project-scope");
  ensureStorage(config.storage);
  migrate({ config });
  const owner = AuthApi.bootstrapSystemAdmin({ config, email: "scope-owner@example.test", password: "verify-password" }).user;

  const projectA = createProject(config, owner.id, "Project A");
  const projectB = createProject(config, owner.id, "Project B");
  const projectC = createProject(config, owner.id, "Project C", false);
  const jobA = enqueue(config, projectA.id, "A-1");
  const jobB = enqueue(config, projectB.id, "B-1");
  const failedJobB = SyncApi.enqueueJob({
    config,
    input: {
      project_id: projectB.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "noop_test",
      payload_json: {},
    },
  });
  const issueB = CisApi.createManualIssue({ config, input: { project_id: projectB.id, summary: "Project B issue" } }).issue;
  createSyncJobRepository({ config }).markFailed(failedJobB.id, new Error("Project B failure"), { retryable: false });
  const db = createConnection({ config });
  db.prepare(
    `INSERT INTO anomaly_log (project_id, issue_id, anomaly_type, severity, status, details_json)
     VALUES (?, ?, 'mapping_gap', 'warning', 'open', '{}')`
  ).run(projectB.id, issueB.id);
  db.close();

  const app = express();
  app.locals.config = config;
  app.use(express.json());
  app.use((req, res, next) => { req.user = owner; next(); });
  app.all("/probe/:projectId", requireProjectWorkspace, (req, res) => success(res, { project_id: req.project.id }));
  app.use("/api/v1", createDashboardRouter({ authenticate: (req, res, next) => next(), requireProjectWorkspace }));
  app.use("/api/v1", createSyncRouter({ authenticate: (req, res, next) => next(), requireProjectWorkspace }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  await withServer(app, async (server) => {
    const invalid = await requestJson(server, { pathname: "/probe/not-a-project" });
    assert.equal(invalid.status, 404);
    assert.equal(invalid.body.error.code, "PROJECT_NOT_FOUND");

    const missing = await requestJson(server, { pathname: "/probe/999999" });
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error.code, "PROJECT_NOT_FOUND");

    const disabled = await requestJson(server, { pathname: `/probe/${projectC.id}` });
    assert.equal(disabled.status, 409);
    assert.equal(disabled.body.error.code, "PROJECT_DISABLED");

    const enabled = await requestJson(server, { pathname: `/probe/${projectA.id}` });
    assert.equal(enabled.status, 200);
    assert.equal(enabled.body.data.project_id, projectA.id);

    const dashboardA = await requestJson(server, { pathname: `/api/v1/projects/${projectA.id}/dashboard/summary` });
    assert.equal(dashboardA.status, 200);
    assert.equal(dashboardA.body.data.counts.pull_jobs_pending, 1);
    assert.equal(dashboardA.body.data.counts.sync_jobs_failed, 0);
    assert.equal(dashboardA.body.data.counts.issue_pending_mapping, 0);
    assert.equal(dashboardA.body.data.counts.anomaly_open, 0);
    assert.equal(dashboardA.body.data.counts.issues_total, 0);
    assert.equal(Object.hasOwn(dashboardA.body.data.counts, "projects_enabled"), false);
    const dashboardAAlerts = await requestJson(server, { pathname: `/api/v1/projects/${projectA.id}/dashboard/alerts` });
    assert.equal(dashboardAAlerts.status, 200);
    assert.deepEqual(dashboardAAlerts.body.data, []);

    const dashboardB = await requestJson(server, { pathname: `/api/v1/projects/${projectB.id}/dashboard/summary` });
    assert.equal(dashboardB.status, 200);
    assert.equal(dashboardB.body.data.counts.pull_jobs_pending, 1);
    assert.equal(dashboardB.body.data.counts.sync_jobs_failed, 1);
    assert.equal(dashboardB.body.data.counts.issue_pending_mapping, 1);
    assert.equal(dashboardB.body.data.counts.anomaly_open, 1);
    assert.equal(dashboardB.body.data.counts.issues_total, 1);
    const dashboardBAlerts = await requestJson(server, { pathname: `/api/v1/projects/${projectB.id}/dashboard/alerts` });
    assert.equal(dashboardBAlerts.status, 200);
    assert.ok(dashboardBAlerts.body.data.every((alert) => alert.project_id === projectB.id));
    assert.ok(dashboardBAlerts.body.data.some((alert) => alert.type === "sync_job_failed"));
    assert.ok(dashboardBAlerts.body.data.some((alert) => alert.type === "anomaly_open"));

    const disabledDashboard = await requestJson(server, { pathname: `/api/v1/projects/${projectC.id}/dashboard/summary` });
    assert.equal(disabledDashboard.status, 409);
    assert.equal(disabledDashboard.body.error.code, "PROJECT_DISABLED");

    const queryMismatch = await requestJson(server, { pathname: `/probe/${projectA.id}?project_id=${projectB.id}` });
    assert.equal(queryMismatch.status, 422);
    assert.equal(queryMismatch.body.error.code, "PROJECT_SCOPE_MISMATCH");

    const bodyMismatch = await requestJson(server, { method: "POST", pathname: `/probe/${projectA.id}`, body: { project_id: projectB.id } });
    assert.equal(bodyMismatch.status, 422);
    assert.equal(bodyMismatch.body.error.code, "PROJECT_SCOPE_MISMATCH");

    const ownJob = await requestJson(server, { pathname: `/api/v1/projects/${projectA.id}/sync-jobs/${jobA.id}` });
    assert.equal(ownJob.status, 200);
    assert.equal(ownJob.body.data.id, jobA.id);

    const foreignJob = await requestJson(server, { pathname: `/api/v1/projects/${projectA.id}/sync-jobs/${jobB.id}` });
    assert.equal(foreignJob.status, 404);
    assert.equal(foreignJob.body.error.code, "RESOURCE_NOT_FOUND");

    const projectAJobs = await requestJson(server, { pathname: `/api/v1/projects/${projectA.id}/sync-jobs` });
    assert.equal(projectAJobs.status, 200);
    assert.equal(projectAJobs.body.data.some((job) => job.id === jobB.id), false);
    const crossCancel = await requestJson(server, { method: "POST", pathname: `/api/v1/projects/${projectA.id}/sync-jobs/${jobB.id}/cancel` });
    assert.equal(crossCancel.status, 404);
    assert.equal(crossCancel.body.error.code, "RESOURCE_NOT_FOUND");
    assert.equal(SyncApi.getJob({ config, jobId: jobB.id }).status, "pending");

    createSyncJobRepository({ config }).markFailed(jobB.id, new Error("Project B retry failure"), { retryable: false });
    const journalBeforeRetry = SyncApi.listJournal({ config, filters: { project_id: projectB.id } }).length;
    const crossRetry = await requestJson(server, { method: "POST", pathname: `/api/v1/projects/${projectA.id}/sync-jobs/${jobB.id}/retry` });
    assert.equal(crossRetry.status, 404);
    assert.equal(crossRetry.body.error.code, "RESOURCE_NOT_FOUND");
    assert.equal(SyncApi.getJob({ config, jobId: jobB.id }).status, "failed");
    assert.equal(SyncApi.listJournal({ config, filters: { project_id: projectB.id } }).length, journalBeforeRetry);

    const projectAJournal = await requestJson(server, { pathname: `/api/v1/projects/${projectA.id}/sync-journal` });
    assert.equal(projectAJournal.status, 200);
    assert.ok(projectAJournal.body.data.every((entry) => entry.project_id === projectA.id));
    const foreignIssueJournal = await requestJson(server, { pathname: `/api/v1/projects/${projectA.id}/issues/${issueB.id}/sync-journal` });
    assert.equal(foreignIssueJournal.status, 404);
    assert.equal(foreignIssueJournal.body.error.code, "RESOURCE_NOT_FOUND");
    const jobsBeforeCrossCreate = SyncApi.listJobs({ config, filters: {} }).length;
    const crossIssueJob = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${projectA.id}/sync-jobs`,
      body: { issue_id: issueB.id, direction_from: "cis", direction_to: "jira", job_type: "push_issue", payload_json: {} },
    });
    assert.equal(crossIssueJob.status, 404);
    assert.equal(crossIssueJob.body.error.code, "RESOURCE_NOT_FOUND");
    assert.equal(SyncApi.listJobs({ config, filters: {} }).length, jobsBeforeCrossCreate);
    const legacyJobs = await requestJson(server, { pathname: ["", "api", "v1", "sync-jobs"].join("/") });
    assert.equal(legacyJobs.status, 404);
    const legacyJournal = await requestJson(server, { pathname: ["", "api", "v1", "sync-journal"].join("/") });
    assert.equal(legacyJournal.status, 404);
    const legacyDashboardSummary = await requestJson(server, { pathname: ["", "api", "v1", "dashboard", "summary"].join("/") });
    assert.equal(legacyDashboardSummary.status, 404);
    const legacyDashboardAlerts = await requestJson(server, { pathname: ["", "api", "v1", "dashboard", "alerts"].join("/") });
    assert.equal(legacyDashboardAlerts.status, 404);
  });

  console.log("Project scope verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
