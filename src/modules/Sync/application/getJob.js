const { AppError } = require("../../../http/errors/AppError");
const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function getJob({ config, jobId }) {
  const job = createSyncJobRepository({ config }).findById(jobId);

  if (!job) {
    throw new AppError({
      code: "SYNC_JOB_NOT_FOUND",
      message: "Sync job not found.",
      status: 404,
    });
  }

  return job;
}

module.exports = {
  getJob,
};
