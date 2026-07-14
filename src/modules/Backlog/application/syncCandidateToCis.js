const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { lookupBacklogIssueIdentity } = require("./lookupBacklogIssueIdentity");
const { getIssueActionReadiness } = require("./getIssueActionReadiness");

function validateWithTranslation(value) {
  if (value !== undefined && typeof value !== "boolean") {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "with_translation must be a JSON boolean.",
      status: 422,
      details: { field: "with_translation" },
    });
  }
}

async function syncCandidateToCis({ config, projectId, backlogIssueKey, executedBy, correlationId, withTranslation }) {
  validateWithTranslation(withTranslation);
  const readiness = getIssueActionReadiness({ config, projectId });
  if (!readiness.actions.sync_to_cis.enabled) {
    const reasons = readiness.actions.sync_to_cis.disabled_reasons;
    const firstReason = reasons[0] || "BACKLOG_PULL_DISABLED";
    const code = firstReason === "PROJECT_DISABLED" ? "PROJECT_SYNC_DISABLED" : firstReason;
    throw new AppError({
      code,
      message: "Sync to CIS is unavailable for this project.",
      status: code === "SYNC_WORKER_UNAVAILABLE" ? 503 : 422,
      details: { disabled_reasons: reasons },
    });
  }
  const identity = await lookupBacklogIssueIdentity({ config, projectId, lookupToken: backlogIssueKey });
  const existing = CisApi.getIssueByBacklogKey({ config, projectId: Number(projectId), backlogIssueKey: identity.canonical_key });
  if (existing) {
    return { outcome: "already_in_cis", issue_id: existing.id, backlog_issue_key: identity.canonical_key, job: null };
  }
  const requestedTranslation = withTranslation === true;
  const payload = {
    mode: "candidate",
    backlog_issue_key: identity.canonical_key,
    with_translation: requestedTranslation,
    ...(requestedTranslation ? {
      requested_by: executedBy || null,
      request_correlation_id: correlationId || null,
    } : {}),
  };
  const enqueueResult = SyncApi.enqueueManualPullIfNoneActive({
    config,
    input: {
      project_id: Number(projectId),
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      payload_json: payload,
      priority: 50,
      trigger: "manual",
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });
  if (enqueueResult.running_without_translation) {
    throw new AppError({
      code: "BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION",
      message: "The active Backlog sync is already running without translation.",
      status: 409,
      details: {
        job_id: enqueueResult.job.id,
        status: enqueueResult.job.status,
      },
    });
  }

  return {
    outcome: "queued",
    issue_id: null,
    backlog_issue_key: identity.canonical_key,
    job: enqueueResult.job,
    reused: enqueueResult.reused,
    promoted: enqueueResult.promoted,
    with_translation: requestedTranslation,
  };
}

module.exports = { syncCandidateToCis };
