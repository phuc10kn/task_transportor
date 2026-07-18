const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const AnomalyApi = require("../../Anomaly/AnomalyApi");
const SyncApi = require("../../Sync/SyncApi");
const { createJiraClient } = require("../infrastructure/JiraClient");
const { assertScopeOperation, createExternalAccessScope } = require("../../../infrastructure/external/core/createExternalAccessScope");
const { evaluateDryRunFreshness, evaluateJiraSyncReadiness } = require("./runJiraDryRun");
const { jiraStoryPointFieldId, jiraUserField } = require("../support/jiraDryRunPayload");

function buildPrecheckError(result) {
  const first = result.validation.errors[0] || {
    code: "JIRA_SYNC_BLOCKED",
    message: "Issue cannot sync to Jira.",
    details: {},
  };

  return new AppError({
    code: first.code,
    message: first.message,
    status: 422,
    details: {
      ...first.details,
      validation: result.validation,
      warnings: result.warnings,
    },
  });
}

function buildStaleDryRunError(readiness, freshness) {
  return new AppError({
    code: "DRY_RUN_STALE",
    message: "Run Jira dry-run again before syncing this issue.",
    status: 422,
    details: {
      canonical_hash: readiness.canonical_hash,
      latest_dry_run_journal_id: freshness.latest_dry_run_journal_id,
      validation: readiness.validation,
      warnings: readiness.warnings,
    },
  });
}

function hasOwn(input, field) {
  return Object.prototype.hasOwnProperty.call(input || {}, field);
}

function textOrNull(value) {
  const text = String(value === null || value === undefined ? "" : value).trim();
  return text || null;
}

function normalizeJiraFields(input = {}) {
  const fields = {};
  for (const field of ["summary", "description", "issue_type", "priority", "status", "assignee", "due_date"]) {
    if (hasOwn(input, field)) {
      fields[field] = textOrNull(input[field]);
    }
  }
  if (hasOwn(input, "story_point")) {
    const storyPoint = Number(input.story_point);
    if (input.story_point === "" || input.story_point === null || !Number.isFinite(storyPoint) || storyPoint < 0) {
      throw new AppError({ code: "INVALID_STORY_POINT", message: "story_point must be a non-negative number.", status: 422 });
    }
    fields.story_point = storyPoint;
  }
  return fields;
}

function buildPayloadOverride(basePayload, jiraFields, targetFields = {}) {
  const payload = JSON.parse(JSON.stringify(basePayload || {}));
  payload.fields = payload.fields || {};

  if (hasOwn(jiraFields, "summary")) {
    payload.fields.summary = jiraFields.summary || "";
  }

  if (hasOwn(jiraFields, "description")) {
    payload.fields.description = jiraFields.description || "";
  }

  if (hasOwn(jiraFields, "issue_type")) {
    payload.fields.issuetype = jiraFields.issue_type ? { name: jiraFields.issue_type } : null;
  }

  if (hasOwn(jiraFields, "priority")) {
    payload.fields.priority = jiraFields.priority ? { name: jiraFields.priority } : null;
  }

  if (hasOwn(jiraFields, "assignee")) {
    if (jiraFields.assignee) {
      payload.fields.assignee = jiraUserField(jiraFields.assignee);
    } else {
      delete payload.fields.assignee;
    }
  }

  if (hasOwn(jiraFields, "due_date")) {
    if (jiraFields.due_date) {
      payload.fields.duedate = jiraFields.due_date;
    } else {
      delete payload.fields.duedate;
    }
  }

  if (hasOwn(jiraFields, "story_point") && targetFields.story_point) {
    payload.fields[targetFields.story_point] = jiraFields.story_point;
  }

  if (hasOwn(jiraFields, "status")) {
    payload.transition_preview = jiraFields.status ? { status: jiraFields.status } : null;
  }

  return payload;
}

async function resolveTargetAtRequest({ config, readiness, executedBy, correlationId }) {
  const client = createJiraClient({ config, projectId: readiness.project.id });
  if (readiness.issue.jira_issue_key) {
    try {
      const linked = await client.getIssue(readiness.issue.jira_issue_key);
      const linkedProject = linked.fields && linked.fields.project && linked.fields.project.key;
      if (linkedProject && String(linkedProject).toUpperCase() !== String(readiness.project.jira_project_key || "").toUpperCase()) {
        throw new AppError({ code: "EXTERNAL_ISSUE_PROJECT_MISMATCH", message: "Linked Jira issue belongs to another project.", status: 422 });
      }
      return { action: "update", verifiedTraceKey: linked.key };
    } catch (error) {
      if (["JIRA_RESOURCE_NOT_FOUND", "JIRA_ISSUE_NOT_FOUND"].includes(error.code)) {
        error.code = "JIRA_LINKED_ISSUE_NOT_FOUND";
        error.retryable = false;
      }
      throw error;
    }
  }
  const matches = await client.searchIssuesByTrace({ backlogIssueKey: readiness.issue.backlog_issue_key, issueId: readiness.issue.id });
  if (matches.length === 0) return { action: "create", verifiedTraceKey: null };
  if (matches.length === 1) {
    const owner = CisApi.getIssueByJiraKey({ config, projectId: readiness.project.id, jiraIssueKey: matches[0].key });
    if (owner && owner.id !== readiness.issue.id) {
      throw new AppError({ code: "EXTERNAL_LINK_DUPLICATE", message: "Jira trace target belongs to another CIS issue.", status: 409 });
    }
    return { action: "update", verifiedTraceKey: String(matches[0].key).trim().toUpperCase() };
  }
  CisApi.markIssueConflict({ config, issueId: readiness.issue.id });
  AnomalyApi.createAnomaly({
    config,
    input: {
      project_id: readiness.project.id,
      issue_id: readiness.issue.id,
      anomaly_type: "unusual_field_change",
      severity: "critical",
      details_json: { reason: "jira_trace_conflict", jira_matches: matches.map((match) => match.key) },
    },
  });
  SyncApi.writeJournal({
    config,
    input: {
      project_id: readiness.project.id,
      issue_id: readiness.issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "push_issue",
      action: "jira_trace_conflict",
      status: "failed",
      trigger: "manual",
      message: "Multiple Jira issues matched the CIS trace.",
      details_json: { jira_matches: matches.map((match) => match.key) },
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });
  throw new AppError({ code: "JIRA_TRACE_CONFLICT", message: "Multiple Jira issues matched the CIS trace.", status: 409 });
}

async function requestJiraSync({ config, issueId, executedBy, correlationId, jiraFields, parentSyncJobId = null }) {
  const readiness = evaluateJiraSyncReadiness({ config, issueId });
  const scope = createExternalAccessScope({ config, projectId: readiness.project.id });
  assertScopeOperation(scope, readiness.project.id, "jira", "jira.issues.search");
  assertScopeOperation(scope, readiness.project.id, "jira", "jira.issue.create");

  if (!readiness.can_sync) {
    throw buildPrecheckError(readiness);
  }

  const freshness = evaluateDryRunFreshness(readiness);
  if (freshness.stale) {
    SyncApi.writeJournal({
      config,
      input: {
        project_id: readiness.project.id,
        issue_id: readiness.issue.id,
        direction_from: "cis",
        direction_to: "jira",
        job_type: "push_issue",
        action: "jira_sync_rejected_stale_dry_run",
        status: "failed",
        trigger: "manual",
        message: "Jira sync rejected because dry-run is stale.",
        details_json: {
          canonical_hash: readiness.canonical_hash,
          latest_dry_run_journal_id: freshness.latest_dry_run_journal_id,
        },
        executed_by: executedBy || null,
        correlation_id: correlationId || null,
      },
    });
    throw buildStaleDryRunError(readiness, freshness);
  }

  const normalizedJiraFields = normalizeJiraFields(jiraFields || {});
  if (hasOwn(normalizedJiraFields, "story_point") && !readiness.target_fields.story_point) {
    throw new AppError({
      code: "JIRA_STORY_POINT_FIELD_UNAVAILABLE",
      message: "Story Point is not available for the target Jira project and issue type.",
      status: 422,
    });
  }
  const hasJiraFieldOverrides = Object.keys(normalizedJiraFields).length > 0;
  const effectiveIssueType = hasOwn(normalizedJiraFields, "issue_type")
    ? normalizedJiraFields.issue_type
    : readiness.payload.fields.issuetype && readiness.payload.fields.issuetype.name;
  const effectiveStoryPointFieldId = jiraStoryPointFieldId(readiness.project, effectiveIssueType);
  const jiraPayloadOverride = hasJiraFieldOverrides
    ? buildPayloadOverride(readiness.payload, normalizedJiraFields, readiness.target_fields)
    : null;
  if (jiraPayloadOverride) {
    const previousStoryPointFieldId = readiness.target_fields.story_point;
    if (previousStoryPointFieldId && previousStoryPointFieldId !== effectiveStoryPointFieldId) {
      delete jiraPayloadOverride.fields[previousStoryPointFieldId];
    }
    if (effectiveStoryPointFieldId) {
      jiraPayloadOverride.fields[effectiveStoryPointFieldId] = hasOwn(normalizedJiraFields, "story_point")
        ? normalizedJiraFields.story_point
        : readiness.canonical.story_point.value;
    }
  }
  const activeJob = SyncApi.hasActiveIssueJob({ config, issueId: readiness.issue.id, jobType: "push_issue" });
  if (activeJob) {
    const sameHash = activeJob.payload_json && activeJob.payload_json.canonical_hash === readiness.canonical_hash;
    const sameOverride = JSON.stringify(activeJob.payload_json && activeJob.payload_json.jira_payload_override || null) === JSON.stringify(jiraPayloadOverride || null);
    if (sameHash && sameOverride) return activeJob;
    throw new AppError({ code: "JIRA_SYNC_STALE", message: "Active Jira sync job is incompatible with this request.", status: 409 });
  }
  const target = await resolveTargetAtRequest({ config, readiness, executedBy, correlationId });

  const prepared = CisApi.prepareJiraSyncJob({
    config,
    issueId: readiness.issue.id,
    expectedHash: readiness.canonical_hash,
    jiraFields: normalizedJiraFields,
    jiraPayloadOverride,
    targetAction: target.action,
    verifiedTraceKey: target.verifiedTraceKey,
    executedBy,
    correlationId,
    parentSyncJobId,
  });
  return prepared.job;
}

module.exports = {
  requestJiraSync,
};
