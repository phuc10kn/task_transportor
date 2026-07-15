const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");
const {
  EDITABLE_CANONICAL_FIELDS,
  READONLY_CANONICAL_FIELDS,
  buildFieldMeta,
} = require("../support/canonicalIssueFields");
const { getFieldSourceValues, resolveCanonicalField } = require("../support/resolveCanonicalField");
const { hashCanonicalIssue } = require("../support/hashCanonicalIssue");
const {
  issueTranslationTargetMap,
  normalizeTranslationSource,
} = require("../support/issueTranslationTargets");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function latestRevision(revisions) {
  return revisions[revisions.length - 1] || null;
}

function revisionFallback(revision, field) {
  if (!revision) {
    return undefined;
  }

  return revision[field];
}

function buildCanonicalSnapshot(issue, revision) {
  const canonical = {};
  for (const field of EDITABLE_CANONICAL_FIELDS) {
    canonical[field] = resolveCanonicalField(issue.fields_json, field, revisionFallback(revision, field));
  }

  return canonical;
}

function buildSources(issue) {
  const sources = {};
  for (const field of [...EDITABLE_CANONICAL_FIELDS, ...READONLY_CANONICAL_FIELDS]) {
    sources[field] = getFieldSourceValues(issue.fields_json, field);
  }
  return sources;
}

function pickAssigneeMeta(fieldsJson) {
  const meta = fieldsJson && fieldsJson.assignee_meta || {};
  return {
    cis: meta.cis && typeof meta.cis === "object"
      ? { jira_account_id: meta.cis.jira_account_id || null }
      : {},
    jira: meta.jira && typeof meta.jira === "object"
      ? {
          account_id: meta.jira.account_id || null,
          email: meta.jira.email || null,
        }
      : {},
  };
}

function summarizeWorklogs(worklogs) {
  const sources = [];
  let totalSpentSeconds = 0;

  for (const worklog of worklogs) {
    totalSpentSeconds += Number(worklog.time_spent_seconds || 0);
    if (worklog.source_system && !sources.includes(worklog.source_system)) {
      sources.push(worklog.source_system);
    }
  }

  return {
    count: worklogs.length,
    total_spent_seconds: totalSpentSeconds,
    sources,
  };
}

function inferIssueTranslationField(item, translationSources, index, total) {
  if (item.target_field) {
    return item.target_field;
  }

  const sourceText = normalizeTranslationSource(item.source_text);
  const summary = normalizeTranslationSource(translationSources.summary);
  const description = normalizeTranslationSource(translationSources.description);

  if (sourceText && sourceText === summary) {
    return "summary";
  }

  if (sourceText && sourceText === description) {
    return "description";
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

function decorateIssueTranslations(translations, issue) {
  const translationSources = issueTranslationTargetMap(issue);
  const issueTranslations = translations.filter((item) => item.target_type === "issue" && !item.comment_id);

  const decorated = issueTranslations
    .map((item, index) => {
      const targetField = inferIssueTranslationField(item, translationSources, index, issueTranslations.length);
      const currentSourceText = targetField ? normalizeTranslationSource(translationSources[targetField]) : "";
      const originalSourceText = normalizeTranslationSource(item.source_text);
      const isCurrentQueueSource = Boolean(currentSourceText && originalSourceText === currentSourceText);
      const isSourceStale = Boolean(originalSourceText && !isCurrentQueueSource);

      return {
        ...item,
        target_field: targetField,
        source_text_original: item.source_text,
        source_text: currentSourceText,
        current_source_text: currentSourceText,
        reviewed_text: undefined,
        ai_draft: item.ai_draft,
        is_source_stale: isSourceStale,
      };
    });

  const picked = [];
  for (const field of ["summary", "description"]) {
    const candidates = decorated.filter((item) => item.target_field === field);
    if (!candidates.length) {
      continue;
    }

    const currentSource = translationSources[field];
    const currentMatches = candidates.filter((item) =>
      normalizeTranslationSource(item.source_text_original) === currentSource
    );
    const latestCurrentMatch = latestTranslationItem(currentMatches);
    picked.push(latestCurrentMatch || latestTranslationItem(candidates));
  }

  return [
    ...picked,
    ...decorated.filter((item) => !item.target_field),
  ];
}

function getIssueEditor({ config, issueId }) {
  const repository = createCisRepository({ config });
  const issue = repository.getIssueById(issueId);

  if (!issue) {
    throw new AppError({
      code: "ISSUE_NOT_FOUND",
      message: "Issue not found.",
      status: 404,
    });
  }

  const project = projectsApi().getProject({ config, projectId: issue.project_id });
  const revisions = repository.listRevisions(issue.id);
  const revision = latestRevision(revisions);
  const canonical = buildCanonicalSnapshot(issue, revision);
  const worklogs = repository.listWorklogs(issue.id);
  const translations = decorateIssueTranslations(repository.listTranslationQueue(issue.id), issue);

  return {
    issue: {
      id: issue.id,
      project_id: issue.project_id,
      backlog_issue_key: issue.backlog_issue_key || null,
      jira_issue_key: issue.jira_issue_key || null,
      source_system: issue.source_system,
      sync_status: issue.sync_status,
      current_revision: issue.current_revision,
      last_synced_at: issue.last_synced_at || null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    },
    canonical,
    sources: buildSources(issue),
    assignee_meta: pickAssigneeMeta(issue.fields_json),
    field_meta: buildFieldMeta(project || {}),
    collections: {
      worklog_summary: summarizeWorklogs(worklogs),
    },
    translation: {
      total: translations.length,
      pending: translations.filter((item) => item.review_status === "pending" || item.review_status === "ai_draft").length,
      approved: translations.filter((item) => item.review_status === "approved").length,
    },
    translations,
    anomaly: {},
    sync: {
      canonical_hash: hashCanonicalIssue({ canonical, issue }),
    },
  };
}

module.exports = {
  buildCanonicalSnapshot,
  decorateIssueTranslations,
  getIssueEditor,
  pickAssigneeMeta,
  summarizeWorklogs,
};
