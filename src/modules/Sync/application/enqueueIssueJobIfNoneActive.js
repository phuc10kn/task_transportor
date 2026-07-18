const { createSyncJobRepository, findActiveIssueJobInDb, insertJobInDb } = require("../infrastructure/SyncJobRepository");
const { getLogger } = require("../../../infrastructure/observability/logger");

function enqueueIssueJobIfNoneActive({ config, input }) {
  const result = createSyncJobRepository({ config }).enqueueIssueJobIfNoneActive(input);
  getLogger(config).info({
    event: result.reused ? "job.reused" : "job.enqueued",
    job_id: result.job.id,
    job_type: result.job.job_type,
    ...(result.reused
      ? { job_trace_id: result.job.trace_id, job_correlation_id: result.job.correlation_id }
      : { trace_id: result.job.trace_id, correlation_id: result.job.correlation_id }),
  });
  return result;
}

function enqueueIssueJobIfNoneActiveInTransaction({ db, input }) {
  const existing = findActiveIssueJobInDb(db, input.issue_id, input.job_type);
  return existing
    ? { job: existing, reused: true }
    : { job: insertJobInDb(db, input), reused: false };
}

module.exports = { enqueueIssueJobIfNoneActive, enqueueIssueJobIfNoneActiveInTransaction };
