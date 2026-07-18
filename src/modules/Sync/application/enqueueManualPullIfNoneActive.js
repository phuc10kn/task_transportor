const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");
const { getLogger } = require("../../../infrastructure/observability/logger");

function enqueueManualPullIfNoneActive({ config, input }) {
  const result = createSyncJobRepository({ config }).enqueueManualPullIfNoneActive(input);
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

module.exports = {
  enqueueManualPullIfNoneActive,
};
