const { createCisRepository } = require("../infrastructure/CisRepository");
const { buildCanonicalSnapshot } = require("./getIssueEditor");
const { updateCanonicalIssue } = require("./updateCanonicalIssue");

const ISSUE_TRANSLATION_FIELDS = new Set(["summary", "description"]);

function latestRevision(revisions) {
  return revisions[revisions.length - 1] || null;
}

function normalize(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function inferTargetField(item, canonical) {
  if (ISSUE_TRANSLATION_FIELDS.has(item.target_field)) {
    return item.target_field;
  }

  const sourceText = normalize(item.source_text);
  if (sourceText && sourceText === normalize(canonical.summary && canonical.summary.value)) {
    return "summary";
  }

  if (sourceText && sourceText === normalize(canonical.description && canonical.description.value)) {
    return "description";
  }

  if (sourceText.includes("\n") || sourceText.length > 120) {
    return "description";
  }

  return null;
}

function applyReviewedIssueTranslation({
  config,
  item,
  text,
  executedBy,
  correlationId,
  reason,
}) {
  if (!item || item.comment_id || item.target_type !== "issue" || !item.issue_id) {
    return { applied: false, reason: "not_issue_translation" };
  }

  if (!text || typeof text !== "string") {
    return { applied: false, reason: "empty_translation_text" };
  }

  const repository = createCisRepository({ config });
  const issue = repository.getIssueById(item.issue_id);
  if (!issue) {
    return { applied: false, reason: "issue_not_found" };
  }

  const revision = latestRevision(repository.listRevisions(issue.id));
  const canonical = buildCanonicalSnapshot(issue, revision);
  const targetField = inferTargetField(item, canonical);
  if (!ISSUE_TRANSLATION_FIELDS.has(targetField)) {
    return { applied: false, reason: "unsupported_target_field" };
  }

  const result = updateCanonicalIssue({
    config,
    issueId: issue.id,
    payload: {
      [targetField]: text,
      reason: reason || "Apply approved issue translation.",
    },
    executedBy: executedBy || null,
    correlationId: correlationId || null,
  });

  return {
    applied: true,
    field: targetField,
    changed_fields: result.changed_fields,
  };
}

module.exports = {
  applyReviewedIssueTranslation,
};
