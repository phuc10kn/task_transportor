const { ISSUE_STATUSES } = require("../../../shared/stateConstants");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");

function normalize(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function issueTargetMap(bundle) {
  return new Map(
    (bundle.targets || [])
      .filter((target) => normalize(target.value))
      .map((target) => [target.field, normalize(target.value)])
  );
}

function currentIssueItems(translations, targetMap) {
  return (translations || []).filter((item) =>
    item.target_type === "issue" &&
    !item.comment_id &&
    targetMap.has(item.target_field) &&
    normalize(item.source_text) === targetMap.get(item.target_field)
  );
}

function syncIssueTranslationState({ config, repository, issueId, correlationId = null }) {
  let bundle = CisApi.getIssueTranslationTargets({ config, issueId });
  const targetlessItems = (bundle.translations || []).filter((item) =>
    item.target_type === "issue" &&
    !item.comment_id &&
    !item.target_field
  );

  if (targetlessItems.length > 0) {
    const queueIds = targetlessItems.map((item) => item.id);
    SyncApi.cancelTranslateJobsForQueueIds({
      config,
      queueIds,
      trigger: "system",
      correlationId,
    });
    repository.deleteQueueItems(queueIds);
    bundle = CisApi.getIssueTranslationTargets({ config, issueId });
  }

  const targetMap = issueTargetMap(bundle);
  if (targetMap.size === 0) {
    return {
      issue: bundle.issue,
      status_updated: false,
      cleaned_queue_ids: targetlessItems.map((item) => item.id),
    };
  }

  const items = currentIssueItems(bundle.translations, targetMap);
  if (items.length === 0) {
    return {
      issue: bundle.issue,
      status_updated: false,
      cleaned_queue_ids: targetlessItems.map((item) => item.id),
    };
  }

  const pendingCount = items.filter((item) => item.review_status === "pending").length;
  const doneCount = items.filter((item) => item.review_status === "approved").length;
  let nextStatus = ISSUE_STATUSES.PENDING_REVIEW;

  if (pendingCount > 0) {
    nextStatus = ISSUE_STATUSES.PENDING_TRANSLATE;
  } else if (doneCount === items.length) {
    nextStatus = ISSUE_STATUSES.APPROVED;
  }

  const issue = CisApi.markIssueSyncStatus({
    config,
    issueId,
    status: nextStatus,
    excludeStatuses: [ISSUE_STATUSES.ARCHIVED, ISSUE_STATUSES.CONFLICT],
  });

  return {
    issue,
    status_updated: issue.sync_status === nextStatus,
    cleaned_queue_ids: targetlessItems.map((item) => item.id),
  };
}

module.exports = {
  syncIssueTranslationState,
};
