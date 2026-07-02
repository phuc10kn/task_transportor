const { AppError } = require("../../../http/errors/AppError");
const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function cancelJob({ config, jobId, executedBy }) {
  const job = createSyncJobRepository({ config }).cancel(jobId, { executedBy });

  if (!job) {
    throw new AppError({
      code: "SYNC_JOB_NOT_CANCELLABLE",
      message: "Only pending sync jobs can be cancelled.",
      status: 422,
    });
  }

  return job;
}

module.exports = {
  cancelJob,
};
