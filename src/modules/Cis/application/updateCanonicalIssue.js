const { AppError } = require("../../../http/errors/AppError");
const { ISSUE_STATUSES } = require("../../../shared/stateConstants");
const SyncApi = require("../../Sync/SyncApi");
const { createCisRepository } = require("../infrastructure/CisRepository");
const {
  EDITABLE_CANONICAL_FIELDS,
  REVISION_CANONICAL_FIELDS,
  isDisallowedEditorField,
  isEditableCanonicalField,
} = require("../support/canonicalIssueFields");
const { hashCanonicalIssue } = require("../support/hashCanonicalIssue");
const { resolveCanonicalField } = require("../support/resolveCanonicalField");
const { buildCanonicalSnapshot, pickAssigneeMeta } = require("./getIssueEditor");

const META_ALLOWED_KEYS = new Set(["jira_account_id"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function latestRevision(revisions) {
  return revisions[revisions.length - 1] || null;
}

function validateDueDate(value) {
  if (value === "") {
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    throw new AppError({
      code: "INVALID_DUE_DATE",
      message: "due_date must be YYYY-MM-DD or an empty string.",
      status: 422,
    });
  }
}

function validateAssigneeMeta(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError({
      code: "INVALID_ASSIGNEE_META",
      message: "assignee_meta must be an object.",
      status: 422,
    });
  }

  for (const key of Object.keys(value)) {
    if (!META_ALLOWED_KEYS.has(key)) {
      throw new AppError({
        code: "INVALID_ASSIGNEE_META",
        message: "assignee_meta only accepts jira_account_id.",
        status: 422,
      });
    }
  }
}

function validatePatchPayload(payload) {
  const fields = [];

  for (const key of Object.keys(payload || {})) {
    if (key === "reason") {
      continue;
    }

    if (key === "assignee_meta") {
      validateAssigneeMeta(payload[key]);
      continue;
    }

    if (isDisallowedEditorField(key) || !isEditableCanonicalField(key)) {
      throw new AppError({
        code: "FIELD_NOT_EDITABLE",
        message: `Field is not editable in Issue Editor: ${key}`,
        status: 422,
      });
    }

    fields.push(key);
  }

  if (payload && payload.assignee_meta && !fields.includes("assignee")) {
    throw new AppError({
      code: "ASSIGNEE_REQUIRED",
      message: "assignee_meta must be patched together with assignee.",
      status: 422,
    });
  }

  if (fields.length === 0 && !(payload && payload.assignee_meta)) {
    throw new AppError({
      code: "NO_EDIT_FIELDS",
      message: "PATCH must include at least one editable field.",
      status: 422,
    });
  }

  if (Object.prototype.hasOwnProperty.call(payload, "summary") && !String(payload.summary || "").trim()) {
    throw new AppError({
      code: "SUMMARY_REQUIRED",
      message: "summary must not be empty.",
      status: 422,
    });
  }

  if (Object.prototype.hasOwnProperty.call(payload, "due_date")) {
    validateDueDate(payload.due_date);
  }

  return fields;
}

function nextSyncStatus(currentStatus, changedFields) {
  if ([ISSUE_STATUSES.SYNCING, ISSUE_STATUSES.ARCHIVED].includes(currentStatus)) {
    throw new AppError({
      code: "ISSUE_EDIT_BLOCKED",
      message: "Issue cannot be edited in its current sync status.",
      status: 409,
      details: { sync_status: currentStatus },
    });
  }

  if (
    changedFields.length > 0 &&
    [ISSUE_STATUSES.APPROVED, ISSUE_STATUSES.SYNCED].includes(currentStatus)
  ) {
    return ISSUE_STATUSES.UPDATE_PENDING;
  }

  return currentStatus;
}

function revisionSnapshotFromCanonical(canonical, previousRevision, fieldsJson) {
  return {
    summary: canonical.summary && canonical.summary.value || "",
    description: canonical.description && canonical.description.value || null,
    issue_type: canonical.issue_type && canonical.issue_type.value || null,
    priority: canonical.priority && canonical.priority.value || null,
    assignee: canonical.assignee && canonical.assignee.value || null,
    fields_json: fieldsJson,
    attachments_json: previousRevision && previousRevision.attachments_json || [],
  };
}

function updateCanonicalIssue({ config, issueId, payload, executedBy, correlationId }) {
  const repository = createCisRepository({ config });
  const issue = repository.getIssueById(issueId);

  if (!issue) {
    throw new AppError({
      code: "ISSUE_NOT_FOUND",
      message: "Issue not found.",
      status: 404,
    });
  }

  const patchFields = validatePatchPayload(payload || {});
  const revisions = repository.listRevisions(issue.id);
  const revision = latestRevision(revisions);
  const fieldsJson = clone(issue.fields_json);
  const beforeCanonical = buildCanonicalSnapshot(issue, revision);
  const beforeHash = hashCanonicalIssue({ canonical: beforeCanonical, issue });
  const before = {};
  const after = {};
  const changedFields = [];

  for (const field of patchFields) {
    const incoming = payload[field];
    const current = resolveCanonicalField(fieldsJson, field, revision && revision[field]);

    if (current.value !== incoming) {
      fieldsJson[field] = {
        ...(fieldsJson[field] && typeof fieldsJson[field] === "object" ? fieldsJson[field] : {}),
        cis: incoming,
      };
      before[field] = current.value;
      after[field] = incoming;
      changedFields.push(field);
    }
  }

  if (payload && payload.assignee_meta) {
    fieldsJson.assignee_meta = {
      ...(fieldsJson.assignee_meta && typeof fieldsJson.assignee_meta === "object" ? fieldsJson.assignee_meta : {}),
      cis: {
        ...(
          fieldsJson.assignee_meta &&
          fieldsJson.assignee_meta.cis &&
          typeof fieldsJson.assignee_meta.cis === "object"
            ? fieldsJson.assignee_meta.cis
            : {}
        ),
        jira_account_id: payload.assignee_meta.jira_account_id || null,
      },
    };
  }

  const issueAfterFields = {
    ...issue,
    fields_json: fieldsJson,
  };
  const afterCanonical = buildCanonicalSnapshot(issueAfterFields, revision);
  const afterHash = hashCanonicalIssue({ canonical: afterCanonical, issue });
  const createsRevision = changedFields.some((field) => REVISION_CANONICAL_FIELDS.includes(field));

  const updated = repository.updateCanonicalIssue({
    issue_id: issue.id,
    fields_json: fieldsJson,
    sync_status: nextSyncStatus(issue.sync_status, changedFields),
    revision_snapshot: createsRevision ? revisionSnapshotFromCanonical(afterCanonical, revision, fieldsJson) : null,
  });

  SyncApi.writeJournal({
    config,
    input: {
      project_id: issue.project_id,
      issue_id: issue.id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "manual_edit",
      action: "issue_manual_edit_saved",
      status: "success",
      trigger: "manual",
      message: "Canonical issue manual edit saved.",
      details_json: {
        changed_fields: changedFields,
        before,
        after,
        assignee_meta: payload && payload.assignee_meta ? {
          before: pickAssigneeMeta(issue.fields_json).cis,
          after: { jira_account_id: payload.assignee_meta.jira_account_id || null },
        } : undefined,
        reason: payload && payload.reason || null,
        actor: executedBy || null,
        canonical_hash_before: beforeHash,
        canonical_hash_after: afterHash,
      },
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });

  return {
    issue: updated,
    changed_fields: changedFields,
    canonical: buildCanonicalSnapshot(updated, latestRevision(repository.listRevisions(issue.id))),
  };
}

module.exports = {
  updateCanonicalIssue,
};
