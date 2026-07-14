const { createConnection } = require("../../../infrastructure/database/connection");

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  return JSON.parse(value);
}

function normalizeLanguage(value, fallback) {
  const normalized = String(value === null || value === undefined ? "" : value)
    .trim()
    .toLowerCase();
  return normalized || fallback;
}

function rowToProjectProfile(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    translation_ai_provider: row.translation_ai_provider || row.translation_provider || null,
    translation_ai_transport: row.translation_ai_transport || null,
    translation_ai_model: row.translation_ai_model || row.translation_model || null,
    enabled: Boolean(row.enabled),
    sync_enabled: Boolean(row.sync_enabled),
    auto_translate: Boolean(row.auto_translate),
    require_translation_review: Boolean(row.require_translation_review),
    require_mapping_approval: Boolean(row.require_mapping_approval),
    manual_pull_enabled: Boolean(row.manual_pull_enabled),
    scheduled_pull_enabled: Boolean(row.scheduled_pull_enabled),
    scheduled_pull_filter_json: parseJson(row.scheduled_pull_filter_json, {}),
    cis_mapping_values_json: parseJson(row.cis_mapping_values_json, {}),
    backlog_mapping_values_json: parseJson(row.backlog_mapping_values_json, {}),
    jira_mapping_values_json: parseJson(row.jira_mapping_values_json, {}),
    source_language: normalizeLanguage(row.source_language, "ja"),
    target_language: normalizeLanguage(row.target_language, "vi"),
  };
}

function createTranslationContextRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    getIssueBundle(issueId) {
      return withDb((db) => {
        const issueRow = db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
        const issue = issueRow
          ? { ...issueRow, status: issueRow.sync_status || issueRow.status }
          : null;
        if (!issue) {
          return null;
        }

        const project = rowToProjectProfile(db.prepare("SELECT * FROM projects WHERE id = ?").get(issue.project_id));
        const revision = db
          .prepare(
            `SELECT *
             FROM issue_revisions
             WHERE issue_id = ? AND revision = ?
             LIMIT 1`
          )
          .get(issueId, issue.current_revision);

        return {
          issue,
          project,
          revision: revision || null,
        };
      });
    },

    listNeighborComments(issueId, commentId, { before = 3, after = 1 } = {}) {
      return withDb((db) => {
        const comments = db
          .prepare(
            `SELECT *
             FROM issue_comments
             WHERE issue_id = ?
             ORDER BY created_at_cis ASC, id ASC`
          )
          .all(issueId);

        if (!commentId) {
          return comments.slice(-before);
        }

        const index = comments.findIndex((comment) => String(comment.id) === String(commentId));
        if (index === -1) {
          return comments.slice(-before);
        }

        const start = Math.max(0, index - before);
        const end = Math.min(comments.length, index + after + 1);

        return comments
          .slice(start, end)
          .filter((comment) => String(comment.id) !== String(commentId));
      });
    },

    listRecentApprovedTranslations(projectId, { limit = 5, targetType } = {}) {
      return withDb((db) => {
        const clauses = [
          "project_id = ?",
          "review_status IN ('approved', 'edited')",
        ];
        const values = [projectId];

        if (targetType) {
          clauses.push("target_type = ?");
          values.push(targetType);
        }

        values.push(limit);

        return db
          .prepare(
            `SELECT *
             FROM translation_queue
             WHERE ${clauses.join(" AND ")}
             ORDER BY reviewed_at DESC, updated_at DESC, id DESC
             LIMIT ?`
          )
          .all(...values);
      });
    },
  };
}

module.exports = {
  createTranslationContextRepository,
};
