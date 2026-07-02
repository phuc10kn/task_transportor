const { AppError } = require("../../../http/errors/AppError");
const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");
const { getHandler } = require("./handlerRegistry");

async function runLockedJob({ config, job, repository }) {
  const handler = getHandler(job.job_type);
  if (!handler) {
    const error = new AppError({
      code: "SYNC_HANDLER_NOT_FOUND",
      message: `No sync handler registered for ${job.job_type}.`,
      status: 500,
    });
    repository.markFailed(job.id, error, { retryable: false });
    return {
      processed: true,
      job: repository.findById(job.id),
    };
  }

  try {
    const result = await handler(job, { config });
    return {
      processed: true,
      job: repository.markSuccess(job.id, { handler_result: result }),
    };
  } catch (error) {
    return {
      processed: true,
      job: repository.markFailed(job.id, error, {
        retryable: Boolean(error.retryable),
        retryAfterSeconds: error.retryAfterSeconds || error.retry_after_seconds || null,
      }),
    };
  }
}

async function runJobNow({ config, jobId, workerId }) {
  const repository = createSyncJobRepository({ config });
  const job = repository.lockById({
    jobId,
    workerId: workerId || config.worker.id,
  });

  if (!job) {
    return {
      processed: false,
      job: repository.findById(jobId),
    };
  }

  return runLockedJob({ config, job, repository });
}

module.exports = {
  runJobNow,
  runLockedJob,
};
