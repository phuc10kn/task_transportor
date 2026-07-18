const { AppError } = require("../../../http/errors/AppError");
const { getLogger } = require("../../../infrastructure/observability/logger");
const { createId, withTraceContext } = require("../../../infrastructure/observability/traceContext");
const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");
const { getHandler } = require("./handlerRegistry");
const { createExternalAccessScope } = require("../../../infrastructure/external/core/createExternalAccessScope");

const EXTERNAL_JOB_TYPES = new Set(["manual_pull", "sync_translate_jira", "push_issue", "push_comment"]);

async function runLockedJob({ config, job, repository }) {
  const logger = getLogger(config);
  const startedAt = Date.now();
  return withTraceContext({
    trace_id: job.trace_id || createId("trc"),
    correlation_id: job.correlation_id || createId("job"),
    project_id: job.project_id,
    job_id: job.id,
    attempt: job.attempt_count,
  }, async () => {
    logger.info({
      event: "job.start",
      job_id: job.id,
      job_type: job.job_type,
      attempt: job.attempt_count,
      worker_id: job.locked_by,
    });

    const handler = getHandler(job.job_type);
    if (!handler) {
      const error = new AppError({
        code: "SYNC_HANDLER_NOT_FOUND",
        message: `No sync handler registered for ${job.job_type}.`,
        status: 500,
      });
      const failedJob = repository.markFailed(job.id, error, { retryable: false });
      logger.error({
        event: "job.end",
        job_id: job.id,
        status: "failed",
        duration_ms: Date.now() - startedAt,
        error: { code: error.code, message: error.message, retryable: false },
      });
      return { processed: true, job: failedJob };
    }

    try {
      const externalAccessScope = EXTERNAL_JOB_TYPES.has(job.job_type)
        ? createExternalAccessScope({ config, projectId: job.project_id })
        : undefined;
      const result = await handler(job, { config, externalAccessScope });
      const completedJob = repository.markSuccess(job.id, { handler_result: result });
      logger.info({
        event: "job.end",
        job_id: job.id,
        status: "success",
        duration_ms: Date.now() - startedAt,
      });
      return { processed: true, job: completedJob };
    } catch (error) {
      const failedJob = repository.markFailed(job.id, error, {
        retryable: Boolean(error.retryable),
        retryAfterSeconds: error.retryAfterSeconds || error.retry_after_seconds || null,
      });
      const event = failedJob && failedJob.status === "pending" ? "job.retry" : "job.end";
      logger.error({
        event,
        job_id: job.id,
        status: failedJob && failedJob.status || "failed",
        duration_ms: Date.now() - startedAt,
        error: {
          code: error.code || "SYNC_JOB_FAILED",
          message: error.message || "Sync job failed.",
          retryable: Boolean(error.retryable),
        },
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
  });
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
