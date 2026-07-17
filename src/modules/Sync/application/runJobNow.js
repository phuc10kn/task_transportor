const { AppError } = require("../../../http/errors/AppError");
const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");
const { getHandler } = require("./handlerRegistry");
const { createExternalAccessScope } = require("../../../infrastructure/external/createExternalAccessScope");

const EXTERNAL_JOB_TYPES = new Set(["manual_pull", "sync_translate_jira", "push_issue", "push_comment"]);

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
    const externalAccessScope = EXTERNAL_JOB_TYPES.has(job.job_type)
      ? createExternalAccessScope({ config, projectId: job.project_id })
      : undefined;
    const result = await handler(job, { config, externalAccessScope });
    return {
      processed: true,
      job: repository.markSuccess(job.id, { handler_result: result }),
    };
  } catch (error) {
    const failedJob = repository.markFailed(job.id, error, {
      retryable: Boolean(error.retryable),
      retryAfterSeconds: error.retryAfterSeconds || error.retry_after_seconds || null,
    });
    return {
      processed: true,
      job: failedJob,
      error: {
        code: error.code || "SYNC_JOB_FAILED",
        message: error.message || "Sync job failed.",
        status: error.status || error.statusCode || 500,
        retryable: Boolean(error.retryable),
      },
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
