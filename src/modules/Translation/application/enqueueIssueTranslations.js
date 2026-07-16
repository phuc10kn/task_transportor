const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");

function normalizeSource(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function isCurrentItem(item, targetMap) {
  return item.target_type === "issue" &&
    !item.comment_id &&
    targetMap.has(item.target_field) &&
    normalizeSource(item.source_text) === targetMap.get(item.target_field);
}

function isEligible(item, includeRejected) {
  if (["approved", "edited"].includes(item.review_status) || item.ai_draft) {
    return false;
  }

  return includeRejected || item.review_status === "pending";
}

function markRetryable(error) {
  if (error.retryable !== undefined) {
    error.retryable = Boolean(error.retryable);
    return error;
  }

  const code = String(error.code || "").toUpperCase();
  const status = Number(error.statusCode || error.status || 0);
  error.retryable = code.startsWith("SQLITE_BUSY") ||
    code.startsWith("SQLITE_LOCKED") ||
    status === 429 ||
    status >= 500;
  return error;
}

async function enqueueIssueTranslations({
  config,
  issueId,
  parentSyncJobId = null,
  requestedBy = null,
  requestCorrelationId = null,
  includeRejected = false,
  executionMode = null,
  enqueueJobs = true,
  targetFields = null,
  trigger = "manual",
}) {
  try {
    const repository = createTranslationRepository({ config });
    const bundle = CisApi.getIssueTranslationTargets({ config, issueId });
    const requestedFields = targetFields ? new Set(targetFields) : null;
    const targets = (bundle.targets || []).filter((target) => !requestedFields || requestedFields.has(target.field));
    const targetMap = new Map(
      targets
        .map((target) => [target.field, normalizeSource(target.value)])
        .filter((entry) => entry[1])
    );
    const translations = (bundle.translations || []).slice();
    const created = [];
    const reusedItems = [];
    const selected = [];

    for (const target of targets) {
      const sourceText = normalizeSource(target.value);
      if (!sourceText) {
        continue;
      }

      const existing = translations
        .filter((item) => item.target_type === "issue" &&
          !item.comment_id &&
          item.target_field === target.field &&
          normalizeSource(item.source_text) === sourceText)
        .sort((left, right) => Number(right.id || 0) - Number(left.id || 0))[0];

      if (existing) {
        reusedItems.push(existing);
        selected.push(existing);
        continue;
      }

      const item = CisApi.createTranslationQueueItem({
        config,
        input: {
          project_id: bundle.issue.project_id,
          issue_id: bundle.issue.id,
          target_type: "issue",
          target_field: target.field,
          source_text: sourceText,
        },
      });
      const decorated = { ...item, target_field: target.field, field: target.field };
      created.push(decorated);
      translations.push(item);
      selected.push(item);
    }

    syncIssueTranslationState({
      config,
      repository,
      issueId: bundle.issue.id,
      correlationId: requestCorrelationId,
    });

    const candidateItems = new Map();
    for (const item of [...selected, ...translations.filter((entry) => isCurrentItem(entry, targetMap))]) {
      if (isEligible(item, includeRejected)) {
        candidateItems.set(String(item.id), item);
      }
    }

    const jobs = [];
    const reusedJobs = [];
    for (const item of enqueueJobs ? candidateItems.values() : []) {
      const payload = {
        translation_queue_id: item.id,
        parent_sync_job_id: parentSyncJobId,
        requested_by: requestedBy || null,
        request_correlation_id: requestCorrelationId || null,
        mode: parentSyncJobId ? "backlog_candidate" : "issue_editor",
        ...(executionMode ? { execution_mode: executionMode } : {}),
      };
      const result = SyncApi.enqueueTranslateJobIfNoneActive({
        config,
        input: {
          project_id: item.project_id,
          issue_id: item.issue_id,
          comment_id: item.comment_id,
          direction_from: "cis",
          direction_to: "cis",
          job_type: "translate",
          payload_json: payload,
          priority: 50,
          max_attempts: executionMode === "manual_immediate" ? 1 : 3,
          trigger,
          executed_by: requestedBy || null,
          correlation_id: requestCorrelationId || null,
        },
      });
      jobs.push(result.job);
      if (result.reused) {
        reusedJobs.push(result.job);
      }
    }

    return {
      issue_id: bundle.issue.id,
      created_items: created,
      reused_items: reusedItems,
      queue_items: [...candidateItems.values()],
      current_items: selected,
      jobs,
      reused_jobs: reusedJobs,
      cleaned_queue_ids: [],
    };
  } catch (error) {
    throw markRetryable(error);
  }
}

module.exports = {
  enqueueIssueTranslations,
  markRetryable,
  normalizeSource,
};
