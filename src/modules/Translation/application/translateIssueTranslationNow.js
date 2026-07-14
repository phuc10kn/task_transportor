const { AppError } = require("../../../http/errors/AppError");
const SyncApi = require("../../Sync/SyncApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const CisApi = require("../../Cis/CisApi");

const ISSUE_TRANSLATION_FIELDS = ["summary", "description"];

function normalizeSource(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function inferTargetField(item, sources) {
  if (ISSUE_TRANSLATION_FIELDS.includes(item.target_field)) {
    return item.target_field;
  }

  const sourceText = normalizeSource(item.source_text);
  for (const field of ISSUE_TRANSLATION_FIELDS) {
    if (sourceText && sourceText === sources[field]) {
      return field;
    }
  }

  if (sourceText.includes("\n") || sourceText.length > 120) {
    return "description";
  }

  return null;
}

function failedJobError(execution) {
  const failure = execution.error || {};
  const error = new AppError({
    code: "TRANSLATION_JOB_FAILED",
    message: failure.message || execution.job.last_error || "Translation job failed.",
    status: failure.status || 502,
    details: {
      job_id: execution.job.id,
      status: execution.job.status,
      retryable: Boolean(failure.retryable),
    },
  });
  error.retryable = Boolean(failure.retryable);
  return error;
}

async function translateIssueTranslationNow({ config, issueId, queueId, executedBy, correlationId }) {
  const repository = createTranslationRepository({ config });
  const item = repository.findById(queueId);
  if (!item || item.issue_id !== issueId || item.target_type !== "issue" || item.comment_id) {
    throw new AppError({
      code: "TRANSLATION_QUEUE_NOT_FOUND",
      message: "Issue translation queue item was not found.",
      status: 404,
    });
  }

  const bundle = CisApi.getIssueTranslationTargets({ config, issueId });
  const sources = bundle.target_map || {};
  const targetField = inferTargetField(item, sources);
  const sourceText = targetField ? sources[targetField] : null;
  if (!sourceText) {
    throw new AppError({
      code: "ISSUE_TRANSLATION_SOURCE_REQUIRED",
      message: "Issue translation source must exist in CIS before translating.",
      status: 422,
    });
  }

  const enqueueResult = SyncApi.enqueueTranslateJobIfNoneActive({
    config,
    input: {
      project_id: item.project_id,
      issue_id: item.issue_id,
      comment_id: item.comment_id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "translate",
      payload_json: {
        translation_queue_id: item.id,
        parent_sync_job_id: null,
        requested_by: executedBy || null,
        request_correlation_id: correlationId || null,
        mode: "issue_editor",
        execution_mode: "manual_immediate",
      },
      priority: 50,
      max_attempts: 1,
      trigger: "manual",
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });

  if (enqueueResult.job.status === "running") {
    return {
      item,
      translated: null,
      execution_status: "queued",
      queued_job_ids: [enqueueResult.job.id],
      job: enqueueResult.job,
      reused: enqueueResult.reused,
    };
  }

  repository.updateSourceText(queueId, sourceText);
  repository.resetForRetranslate(queueId);

  const execution = await SyncApi.runJobNow({
    config,
    jobId: enqueueResult.job.id,
    workerId: `issue-editor-${process.pid}`,
  });
  if (!execution.processed || !execution.job || ["pending", "running"].includes(execution.job.status)) {
    return {
      item: repository.findById(queueId),
      translated: null,
      execution_status: "queued",
      queued_job_ids: [execution.job ? execution.job.id : enqueueResult.job.id],
      job: execution.job || enqueueResult.job,
      reused: enqueueResult.reused,
    };
  }
  if (execution.job.status === "failed") {
    throw failedJobError(execution);
  }

  const translatedItem = repository.findById(queueId);
  return {
    item: translatedItem,
    translated: {
      translation_queue_id: translatedItem.id,
      review_status: translatedItem.review_status,
      provider: translatedItem.provider,
      confidence: translatedItem.confidence,
    },
    execution_status: "completed",
    queued_job_ids: [],
    job: execution.job,
    reused: enqueueResult.reused,
  };
}

module.exports = {
  translateIssueTranslationNow,
};
