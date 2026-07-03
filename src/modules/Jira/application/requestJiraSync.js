const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createJiraSyncRepository } = require("../infrastructure/JiraSyncRepository");
const { evaluateDryRunFreshness, evaluateJiraSyncReadiness } = require("./runJiraDryRun");
const { jiraUserField } = require("../support/jiraDryRunPayload");

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
  return fields;
}

function buildPayloadOverride(basePayload, jiraFields) {
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

  if (hasOwn(jiraFields, "status")) {
    payload.transition_preview = jiraFields.status ? { status: jiraFields.status } : null;
  }

  return payload;
}

function requestJiraSync({ config, issueId, executedBy, correlationId, jiraFields }) {
  const repository = createJiraSyncRepository({ config });
  const readiness = evaluateJiraSyncReadiness({ config, issueId });

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

  const activeJob = repository.findActiveIssueSyncJob(readiness.issue.id);
  if (activeJob) {
    return activeJob;
  }

  const normalizedJiraFields = normalizeJiraFields(jiraFields || {});
  const hasJiraFieldOverrides = Object.keys(normalizedJiraFields).length > 0;
  const jiraPayloadOverride = hasJiraFieldOverrides
    ? buildPayloadOverride(readiness.payload, normalizedJiraFields)
    : null;

  if (hasJiraFieldOverrides) {
    CisApi.saveJiraDraftFields({
      config,
      issueId: readiness.issue.id,
      input: normalizedJiraFields,
    });
    SyncApi.writeJournal({
      config,
      input: {
        project_id: readiness.project.id,
        issue_id: readiness.issue.id,
        direction_from: "cis",
        direction_to: "jira",
        job_type: "push_issue",
        action: "jira_draft_saved",
        status: "success",
        trigger: "manual",
        message: "Jira draft fields saved before sync.",
        details_json: {
          fields: Object.keys(normalizedJiraFields),
          canonical_hash: readiness.canonical_hash,
        },
        executed_by: executedBy || null,
        correlation_id: correlationId || null,
      },
    });
  }

  const job = SyncApi.enqueueJob({
    config,
    input: {
      project_id: readiness.project.id,
      issue_id: readiness.issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "push_issue",
      payload_json: {
        requested_by: executedBy || null,
        canonical_hash: readiness.canonical_hash,
        jira_payload_override: jiraPayloadOverride,
      },
      priority: 40,
      trigger: "manual",
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });

  SyncApi.writeJournal({
    config,
    input: {
      sync_job_id: job.id,
      project_id: readiness.project.id,
      issue_id: readiness.issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "push_issue",
      action: "jira_sync_requested",
      status: "pending",
      trigger: "manual",
      message: "Jira sync job requested.",
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });

  return job;
}

module.exports = {
  requestJiraSync,
};
