const { createConnection } = require("../../../infrastructure/database/connection");
const { runInTransaction } = require("../../../infrastructure/database/transaction");
const { parseJson } = require("../../../shared/json");

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

function rowToJob(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    payload_json: parseJson(row.payload_json, {}),
  };
}

function mergeIssueFields(existingFields, input) {
  const fields = {
    ...(existingFields || {}),
  };

  if (input.summary) {
    fields.summary = {
      ...(fields.summary || {}),
      jira: input.summary,
    };
  }

  if (input.description) {
    fields.description = {
      ...(fields.description || {}),
      jira: input.description,
    };
  }

  if (input.issue_type) {
    fields.issue_type = {
      ...(fields.issue_type || {}),
      jira: input.issue_type,
    };
  }

  if (input.priority) {
    fields.priority = {
      ...(fields.priority || {}),
      jira: input.priority,
    };
  }

  if (input.status) {
    fields.status = {
      ...(fields.status || {}),
      jira: input.status,
    };
  }

  if (input.assignee) {
    fields.assignee = {
      ...(fields.assignee || {}),
      jira: input.assignee,
    };
  }

  if (input.due_date) {
    fields.due_date = {
      ...(fields.due_date || {}),
      jira: input.due_date,
    };
  }

  if (input.reporter) {
    fields.reporter = {
      ...(fields.reporter || {}),
      jira: input.reporter,
    };
  }

  return fields;
}

function createJiraSyncRepository({ config }) {
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

    findActiveIssueSyncJob(issueId) {
      return withDb((db) =>
        rowToJob(
          db
            .prepare(
              `SELECT *
               FROM sync_jobs
               WHERE issue_id = ?
                 AND job_type = 'push_issue'
                 AND status IN ('pending', 'running')
               ORDER BY created_at DESC
               LIMIT 1`
            )
            .get(issueId)
        )
      );
    },

    markIssueStatus(issueId, status) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE issues
             SET sync_status = ?,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(status, issueId);

        return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
      });
    },

    markIssueConflict(issueId) {
      return this.markIssueStatus(issueId, "conflict");
    },

    saveJiraDraftFields(issueId, input) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const existing = rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
          if (!existing) {
            return null;
          }

          const fieldsJson = mergeIssueFields(existing.fields_json, input || {});

          db
            .prepare(
              `UPDATE issues
               SET fields_json = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(JSON.stringify(fieldsJson), issueId);

          return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
        })
      );
    },

    saveIssueSyncResult(issueId, input) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const existing = rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
          if (!existing) {
            return null;
          }

          const fieldsJson = mergeIssueFields(existing.fields_json, {
            summary: input.summary,
            description: input.description,
            issue_type: input.issue_type,
            priority: input.priority,
            status: input.status,
            assignee: input.assignee,
            due_date: input.due_date,
            reporter: input.reporter,
          });

          db
            .prepare(
              `UPDATE issues
               SET jira_issue_key = ?,
                   sync_status = ?,
                   last_synced_at = datetime('now'),
                   jira_updated_at = datetime('now'),
                   fields_json = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(
              input.jira_issue_key,
              input.issue_status || "synced",
              JSON.stringify(fieldsJson),
              issueId
            );

          return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
        })
      );
    },

    listSyncableComments(issueId) {
      return withDb((db) =>
        db
          .prepare(
            `SELECT *
             FROM issue_comments
             WHERE issue_id = ?
               AND source_system = 'backlog'
               AND content_translated IS NOT NULL
               AND TRIM(content_translated) != ''
               AND sync_status != 'synced'
             ORDER BY created_at_cis ASC`
          )
          .all(issueId)
      );
    },

    markCommentSynced(commentId, jiraCommentId) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE issue_comments
             SET jira_comment_id = ?,
                 sync_status = 'synced',
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(jiraCommentId, commentId);

        return db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(commentId);
      });
    },

    markCommentFailed(commentId) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE issue_comments
             SET sync_status = 'failed',
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(commentId);

        return db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(commentId);
      });
    },
  };
}

module.exports = {
  createJiraSyncRepository,
};
