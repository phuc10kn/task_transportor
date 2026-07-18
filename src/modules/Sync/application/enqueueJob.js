const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");
const { getLogger } = require("../../../infrastructure/observability/logger");

function enqueueJob({ config, input }) {
  const job = createSyncJobRepository({ config }).enqueue(input);
  getLogger(config).info({
    event: "job.enqueued",
    trace_id: job.trace_id,
    correlation_id: job.correlation_id,
    job_id: job.id,
    job_type: job.job_type,
  });
  return job;
}

module.exports = {
  enqueueJob,
};
