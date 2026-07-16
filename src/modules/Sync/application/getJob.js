const { AppError } = require("../../../http/errors/AppError");
const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function getJob({ config, jobId, projectId }) {
  const job = createSyncJobRepository({ config }).findById(jobId, projectId);

  if (!job) {
    throw new AppError({
      code: projectId ? "RESOURCE_NOT_FOUND" : "SYNC_JOB_NOT_FOUND",
      message: "Sync job not found.",
      status: 404,
    });
  }

  return job;
}

module.exports = {
  getJob,
};
