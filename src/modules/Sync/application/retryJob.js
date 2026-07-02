const { AppError } = require("../../../http/errors/AppError");
const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function retryJob({ config, jobId, executedBy }) {
  const job = createSyncJobRepository({ config }).retryFailed(jobId, { executedBy });

  if (!job) {
    throw new AppError({
      code: "SYNC_JOB_NOT_RETRYABLE",
      message: "Only failed sync jobs can be retried.",
      status: 422,
    });
  }

  return job;
}

module.exports = {
  retryJob,
};
