const assert = require("assert");

const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const { createSyncJobRepository } = require("../../src/modules/Sync/infrastructure/SyncJobRepository");
const { makeTempConfig } = require("./helpers/tempConfig");

function createProjectAndIssue(config) {
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Sync Jobs Verify Project",
      sync_enabled: true,
      backlog_project_key: "WEC",
      backlog_issue_key_prefix: "WEC",
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_project_key: "SYNC",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_API_TOKEN",
      translation_provider: "deepseek",
    },
  });
  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: "WEC-1",
      source_system: "backlog",
    },
  });

  return { issue, project };
}

function forceJobRunningStale(config, jobId, secondsAgo) {
  const db = createConnection({ config });
  db.prepare("UPDATE sync_jobs SET locked_at = datetime('now', ?), status = 'running' WHERE id = ?")
    .run(`-${secondsAgo} seconds`, jobId);
  db.close();
}

async function main() {
  const config = makeTempConfig("sync-jobs", {
    WORKER_ID: "verify-worker",
    WORKER_LOCK_TIMEOUT_SECONDS: "60",
  });

  ensureStorage(config.storage);
  migrate({ config });

  const { project, issue } = createProjectAndIssue(config);
  const futurePullJob = SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      run_after: "2999-01-01 00:00:00",
      payload_json: { backlog_issue_key: "WEC-1" },
      trigger: "manual",
    },
  });
  assert.equal(futurePullJob.direction_from, "backlog");
  assert.equal(futurePullJob.direction_to, "cis");

  const noopJob = SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "noop_test",
      priority: 10,
      payload_json: { ok: true },
      trigger: "manual",
    },
  });

  const pending = SyncApi.listJobs({ config, filters: { status: "pending" } });
  assert.ok(pending.some((job) => job.id === noopJob.id));

  const workerResult = await SyncApi.runWorkerOnce({ config, workerId: "verify-worker" });
  assert.equal(workerResult.processed, true);
  assert.equal(workerResult.job.id, noopJob.id);
  assert.equal(workerResult.job.status, "success");
  assert.equal(workerResult.job.attempt_count, 1);

  const successJournal = SyncApi.listJournal({
    config,
    filters: { sync_job_id: noopJob.id },
  });
  assert.ok(successJournal.some((entry) => entry.action === "job_enqueued"));
  assert.ok(successJournal.some((entry) => entry.action === "job_locked"));
  assert.ok(successJournal.some((entry) => entry.action === "job_success"));
  assert.ok(successJournal.every((entry) => entry.direction_from && entry.direction_to));

  const retryableJob = SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "noop_test",
      priority: 20,
      payload_json: { fail: true, retryable: true, error_message: "Retry me" },
      trigger: "manual",
    },
  });
  const retryResult = await SyncApi.runWorkerOnce({ config, workerId: "verify-worker" });
  assert.equal(retryResult.job.id, retryableJob.id);
  assert.equal(retryResult.job.status, "pending");
  assert.equal(retryResult.job.attempt_count, 1);
  assert.equal(retryResult.job.last_error, "Retry me");
  assert.ok(retryResult.job.run_after);

  const cancellable = SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "noop_test",
      run_after: "2999-01-01 00:00:00",
      payload_json: { cancel: true },
      trigger: "manual",
    },
  });
  const cancelled = SyncApi.cancelJob({ config, jobId: cancellable.id, executedBy: null });
  assert.equal(cancelled.status, "cancelled");

  const jobRepository = createSyncJobRepository({ config });
  const staleRunning = SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "noop_test",
      priority: 5,
      payload_json: { stale_running: true },
      trigger: "manual",
    },
  });
  const staleRepositoryJob = jobRepository.lockNext({ workerId: "verify-locker" });
  assert.equal(staleRepositoryJob.id, staleRunning.id);
  forceJobRunningStale(config, staleRunning.id, 3600);

  const recovered = SyncApi.recoverStaleJobs({
    config,
    workerId: "verify-worker",
    lockTimeoutSeconds: 60,
  });
  assert.ok(recovered.recovered.some((job) => job.id === staleRunning.id));
  assert.equal(recovered.failed.length, 0);

  const freshRunning = SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "noop_test",
      priority: 1,
      payload_json: { fresh_running: true },
      trigger: "manual",
    },
  });
  const freshLocked = jobRepository.lockNext({ workerId: "verify-locker" });
  assert.equal(freshLocked.id, freshRunning.id);
  const freshRecovery = SyncApi.recoverStaleJobs({
    config,
    workerId: "verify-worker",
    lockTimeoutSeconds: 60,
  });
  assert.equal(freshRecovery.recovered.length, 0);
  assert.equal(freshRecovery.failed.length, 0);
  assert.equal(jobRepository.cancel(freshRunning.id, { executedBy: null }), null);

  const staleJournal = SyncApi.listJournal({
    config,
    filters: { sync_job_id: staleRunning.id },
  });
  assert.ok(staleJournal.some((entry) => entry.action === "stale_recovered"));

  console.log("Sync jobs verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
