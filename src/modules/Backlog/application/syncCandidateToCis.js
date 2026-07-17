const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { getIssueActionReadiness } = require("./getIssueActionReadiness");
const { assertScopeOperation, createExternalAccessScope } = require("../../../infrastructure/external/createExternalAccessScope");

function validateBoolean(value, field) {
  if (value !== undefined && typeof value !== "boolean") {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: `${field} must be a JSON boolean.`,
      status: 422,
      details: { field },
    });
  }
}

function normalizeBacklogIssueKey(value) {
  const key = String(value || "").trim().toUpperCase();
  if (!key) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "A Backlog issue key is required.",
      status: 422,
      details: { field: "backlog_issue_key" },
    });
  }
  return key;
}

async function syncCandidateToCis({ config, projectId, backlogIssueKey, executedBy, correlationId, withTranslation, pushToJira }) {
  validateBoolean(withTranslation, "with_translation");
  validateBoolean(pushToJira, "push_to_jira");
  const scope = createExternalAccessScope({ config, projectId: Number(projectId) });
  assertScopeOperation(scope, projectId, "backlog", "backlog.issue.get");
  if (pushToJira === true) {
    assertScopeOperation(scope, projectId, "jira", "jira.issues.search");
    assertScopeOperation(scope, projectId, "jira", "jira.issue.create");
  }
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
  const normalizedKey = normalizeBacklogIssueKey(backlogIssueKey);
  const existing = CisApi.getIssueByBacklogKey({ config, projectId: Number(projectId), backlogIssueKey: normalizedKey });
  if (existing) {
    return { outcome: "already_in_cis", issue_id: existing.id, backlog_issue_key: normalizedKey, job: null };
  }
  const requestedJiraPush = pushToJira === true;
  const requestedTranslation = requestedJiraPush || withTranslation === true;
  const payload = {
    mode: "candidate",
    backlog_issue_key: normalizedKey,
    with_translation: requestedTranslation,
    push_to_jira: requestedJiraPush,
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
      direction_to: requestedJiraPush ? "jira" : "cis",
      job_type: requestedJiraPush ? "sync_translate_jira" : "manual_pull",
      payload_json: payload,
      priority: 50,
      max_attempts: requestedJiraPush ? 5 : 3,
      trigger: "manual",
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });
  if (enqueueResult.running_without_jira) {
    throw new AppError({
      code: "BACKLOG_SYNC_RUNNING_WITHOUT_JIRA",
      message: "The active Backlog sync is already running without Jira delivery.",
      status: 409,
      details: {
        job_id: enqueueResult.job.id,
        status: enqueueResult.job.status,
      },
    });
  }
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
    backlog_issue_key: normalizedKey,
    job: enqueueResult.job,
    reused: enqueueResult.reused,
    promoted: enqueueResult.promoted,
    with_translation: requestedTranslation,
    push_to_jira: requestedJiraPush,
  };
}

module.exports = { syncCandidateToCis };
