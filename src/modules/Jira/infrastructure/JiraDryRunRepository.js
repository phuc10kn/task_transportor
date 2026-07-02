const { createConnection } = require("../../../infrastructure/database/connection");

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  return JSON.parse(value);
}

function rowToProject(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    enabled: Boolean(row.enabled),
    sync_enabled: Boolean(row.sync_enabled),
    auto_translate: Boolean(row.auto_translate),
    require_translation_review: Boolean(row.require_translation_review),
    require_mapping_approval: Boolean(row.require_mapping_approval),
    manual_pull_enabled: Boolean(row.manual_pull_enabled),
    scheduled_pull_enabled: Boolean(row.scheduled_pull_enabled),
    scheduled_pull_filter_json: parseJson(row.scheduled_pull_filter_json, {}),
  };
}

function rowToIssue(row) {
  if (!row) {
    return null;
  }

  const syncStatus = row.sync_status || row.status;

  return {
    ...row,
    sync_status: syncStatus,
    status: syncStatus,
    fields_json: parseJson(row.fields_json, {}),
  };
}

function rowToRevision(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    attachments_json: parseJson(row.attachments_json, []),
  };
}

function createJiraDryRunRepository({ config }) {
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
        const issue = rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
        if (!issue) {
          return null;
        }

        const project = rowToProject(
          db.prepare("SELECT * FROM projects WHERE id = ?").get(issue.project_id)
        );
        const revision = rowToRevision(
          db
            .prepare(
              `SELECT * FROM issue_revisions
               WHERE issue_id = ? AND revision = ?
               LIMIT 1`
            )
            .get(issue.id, issue.current_revision)
        );
        const translations = db
          .prepare("SELECT * FROM translation_queue WHERE issue_id = ? ORDER BY id ASC")
          .all(issue.id);
        const comments = db
          .prepare("SELECT * FROM issue_comments WHERE issue_id = ? ORDER BY created_at_cis ASC")
          .all(issue.id);
        const attachments = db
          .prepare("SELECT * FROM issue_attachments WHERE issue_id = ? ORDER BY created_at_cis ASC")
          .all(issue.id);

        return {
          attachments,
          comments,
          issue,
          project,
          revision,
          translations,
        };
      });
    },
  };
}

module.exports = {
  createJiraDryRunRepository,
};
