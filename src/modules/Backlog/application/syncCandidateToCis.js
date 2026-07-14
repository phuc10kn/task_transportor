const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { lookupBacklogIssueIdentity } = require("./lookupBacklogIssueIdentity");
const { getIssueActionReadiness } = require("./getIssueActionReadiness");

async function syncCandidateToCis({ config, projectId, backlogIssueKey, executedBy, correlationId }) {
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
  const job = SyncApi.enqueueManualPullIfNoneActive({
    config,
    input: {
      project_id: Number(projectId),
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      payload_json: { mode: "candidate", backlog_issue_key: identity.canonical_key },
      priority: 50,
      trigger: "manual",
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });
  return { outcome: "queued", issue_id: null, backlog_issue_key: identity.canonical_key, job };
}

module.exports = { syncCandidateToCis };
