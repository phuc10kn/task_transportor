const { AppError } = require("../../../http/errors/AppError");
const { translateQueueItemNow } = require("./translateQueueItemNow");

async function handleTranslateJob(job, { config }) {
  const payload = job.payload_json || {};
  const queueId = payload.translation_queue_id;
  if (!queueId) {
    throw new AppError({
      code: "TRANSLATE_PAYLOAD_INVALID",
      message: "translate job requires payload_json.translation_queue_id.",
      status: 422,
    });
  }

  return translateQueueItemNow({
    config,
    queueId,
    executedBy: payload.requested_by || null,
    correlationId: payload.request_correlation_id || null,
    syncJobId: job.id,
    attemptCount: job.attempt_count,
    trigger: "ai",
    maxImmediateAttempts: payload.execution_mode === "manual_immediate" ? 2 : 1,
  });
}

module.exports = {
  handleTranslateJob,
};
