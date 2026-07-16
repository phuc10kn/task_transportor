const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { enqueueIssueTranslations } = require("./enqueueIssueTranslations");

function normalizeSource(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function issueTranslationItems(items) {
  return items.filter((item) => item.target_type === "issue" && !item.comment_id);
}

function inferTargetField(item, targets, index, total) {
  if (item.target_field) {
    return item.target_field;
  }

  const sourceText = normalizeSource(item.source_text);
  const target = targets.find((entry) => normalizeSource(entry.value) === sourceText);
  if (target) {
    return target.field;
  }

  if (sourceText.includes("\n") || sourceText.length > 120) {
    return "description";
  }

  if (total > 1) {
    return index === 0 ? "summary" : "description";
  }

  return null;
}

function translationTimeKey(item) {
  return item.updated_at || item.created_at || "";
}

function latestTranslationItem(items) {
  return items
    .slice()
    .sort((left, right) => {
      const timeCompare = translationTimeKey(left).localeCompare(translationTimeKey(right));
      if (timeCompare !== 0) {
        return timeCompare;
      }

      return Number(left.id || 0) - Number(right.id || 0);
    })
    .pop() || null;
}

function decorateTranslations(items, targets) {
  const issueItems = issueTranslationItems(items);
  const decorated = issueItems.map((item, index) => {
    const targetField = inferTargetField(item, targets, index, issueItems.length);
    const target = targets.find((entry) => entry.field === targetField);
    const currentSource = normalizeSource(target && target.value);
    const originalSource = normalizeSource(item.source_text);
    const isCurrentQueueSource = Boolean(currentSource && originalSource === currentSource);
    const isSourceStale = Boolean(originalSource && !isCurrentQueueSource);

    return {
      ...item,
      target_field: targetField,
      source_text_original: item.source_text,
      source_text: currentSource,
      current_source_text: currentSource,
      reviewed_text: undefined,
      ai_draft: item.ai_draft,
      is_source_stale: isSourceStale,
    };
  });

  const picked = [];
  for (const target of targets) {
    const currentSource = normalizeSource(target.value);
    const candidates = decorated.filter((item) => item.target_field === target.field);
    if (!candidates.length) {
      continue;
    }

    const currentMatches = candidates.filter((item) => normalizeSource(item.source_text_original) === currentSource);
    const latestCurrentMatch = latestTranslationItem(currentMatches);
    picked.push(latestCurrentMatch || latestTranslationItem(candidates));
  }

  return [
    ...picked,
    ...decorated.filter((item) => !item.target_field),
  ];
}

async function requestIssueTranslations({ config, issueId, targetField = null, executedBy, correlationId }) {
  if (targetField && !["summary", "description"].includes(targetField)) {
    throw new AppError({ code: "TRANSLATION_FIELD_INVALID", message: "target_field must be summary or description.", status: 422 });
  }
  const repository = createTranslationRepository({ config });
  const bundle = CisApi.getIssueTranslationTargets({ config, issueId });
  const queued = await enqueueIssueTranslations({
    config,
    issueId,
    requestedBy: executedBy || null,
    requestCorrelationId: correlationId || null,
    includeRejected: true,
    executionMode: "manual_immediate",
    targetFields: targetField ? [targetField] : null,
    trigger: "manual",
  });
  const translated = [];
  const queuedJobs = [];
  for (const job of queued.jobs) {
    if (job.status === "running") {
      queuedJobs.push(job);
      continue;
    }

    const execution = await SyncApi.runJobNow({
      config,
      jobId: job.id,
      workerId: `issue-editor-${process.pid}`,
    });
    if (!execution.processed || !execution.job || ["pending", "running"].includes(execution.job.status)) {
      queuedJobs.push(execution.job || job);
      continue;
    }
    if (execution.job.status === "failed") {
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
      throw error;
    }

    const item = repository.findById(job.payload_json.translation_queue_id);
    if (item) {
      translated.push({
        translation_queue_id: item.id,
        review_status: item.review_status,
        provider: item.provider,
        confidence: item.confidence,
      });
    }
  }

  const refreshed = CisApi.getIssueTranslationTargets({ config, issueId });
  const executionStatus = queuedJobs.length === 0
    ? "completed"
    : translated.length > 0 ? "partial_queued" : "queued";
  return {
    issue_id: bundle.issue.id,
    created_items: queued.created_items,
    reused_items: queued.reused_items,
    queued_jobs: queuedJobs,
    queued_job_ids: queuedJobs.filter(Boolean).map((job) => job.id),
    execution_status: executionStatus,
    translated_items: translated,
    translations: decorateTranslations(refreshed.translations, refreshed.targets),
  };
}

module.exports = {
  requestIssueTranslations,
};
