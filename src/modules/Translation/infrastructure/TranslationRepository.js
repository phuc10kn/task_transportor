const { createConnection } = require("../../../infrastructure/database/connection");
const { runInTransaction } = require("../../../infrastructure/database/transaction");
const {
  ISSUE_STATUSES,
  TRANSLATION_REVIEW_STATUSES,
} = require("../../../shared/stateConstants");

function rowToTranslation(row) {
  return row || null;
}

function normalize(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  return JSON.parse(value);
}

function issueTranslationTargetSources(fieldsJson) {
  const fields = parseJson(fieldsJson, {});
  return {
    summary: normalize(fields.summary && fields.summary.backlog),
    description: normalize(fields.description && fields.description.backlog),
  };
}

function fieldCurrentPredicate(field) {
  return `
    target_type = 'issue'
    AND comment_id IS NULL
    AND target_field = '${field}'
    AND TRIM(source_text) = ?
  `;
}

function deleteMissingIssueTargetFieldJobs(db, issueId) {
  const rows = db
    .prepare(
      `SELECT id
       FROM translation_queue
       WHERE issue_id = ?
         AND target_type = 'issue'
         AND comment_id IS NULL
         AND target_field IS NULL`
    )
    .all(issueId);

  if (rows.length === 0) {
    return 0;
  }

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(", ");

  db
    .prepare(
      `DELETE FROM sync_jobs
       WHERE job_type = 'translate'
         AND json_extract(payload_json, '$.translation_queue_id') IN (${placeholders})`
    )
    .run(...ids);

  return db
    .prepare(`DELETE FROM translation_queue WHERE id IN (${placeholders})`)
    .run(...ids).changes;
}

function refreshIssueTranslationStatus(db, issueId) {
  deleteMissingIssueTargetFieldJobs(db, issueId);

  const issue = db.prepare("SELECT fields_json FROM issues WHERE id = ?").get(issueId);
  if (!issue) {
    return null;
  }

  const targets = issueTranslationTargetSources(issue.fields_json);
  const clauses = [];
  const values = [];
  for (const field of ["summary", "description"]) {
    if (targets[field]) {
      clauses.push(`(${fieldCurrentPredicate(field)})`);
      values.push(targets[field]);
    }
  }

  if (clauses.length === 0) {
    return null;
  }

  const counts = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
         SUM(CASE WHEN review_status IN ('approved', 'edited') THEN 1 ELSE 0 END) AS done_count
       FROM translation_queue
       WHERE issue_id = ?
         AND (${clauses.join(" OR ")})`
    )
    .get(issueId, ...values);

  if (!counts || counts.total === 0) {
    return null;
  }

  let nextStatus = ISSUE_STATUSES.PENDING_REVIEW;
  if (Number(counts.pending_count || 0) > 0) {
    nextStatus = ISSUE_STATUSES.PENDING_TRANSLATE;
  } else if (Number(counts.done_count || 0) === Number(counts.total)) {
    nextStatus = ISSUE_STATUSES.APPROVED;
  }

  db
    .prepare(
      `UPDATE issues
       SET sync_status = ?, updated_at = datetime('now')
       WHERE id = ? AND sync_status NOT IN ('archived', 'conflict')`
    )
    .run(nextStatus, issueId);

  const row = db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
  return row ? { ...row, status: row.sync_status || row.status } : null;
}

function createTranslationRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    list(filters = {}) {
      return withDb((db) => {
        const clauses = [];
        const values = [];

        if (filters.project_id) {
          clauses.push("project_id = ?");
          values.push(filters.project_id);
        }

        if (filters.issue_id) {
          clauses.push("issue_id = ?");
          values.push(filters.issue_id);
        }

        if (filters.review_status) {
          clauses.push("review_status = ?");
          values.push(filters.review_status);
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
        return db
          .prepare(`SELECT * FROM translation_queue ${where} ORDER BY id ASC`)
          .all(...values)
          .map(rowToTranslation);
      });
    },

    findById(queueId) {
      return withDb((db) =>
        rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId))
      );
    },

    markAiDraft(queueId, input) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const item = db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId);
          if (!item) {
            return null;
          }

          db
            .prepare(
              `UPDATE translation_queue
               SET ai_draft = ?,
                   review_status = 'ai_draft',
                   provider = ?,
                   model_or_command = ?,
                   provider_request_id = ?,
                   confidence = ?,
                   provider_error = NULL,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(
              input.ai_draft,
              input.provider || item.provider,
              input.model_or_command || item.model_or_command,
              input.provider_request_id || null,
              input.confidence === undefined ? null : input.confidence,
              queueId
            );

          if (
            input.confidence !== null &&
            input.confidence !== undefined &&
            Number(input.confidence) < config.translation.lowConfidenceThreshold
          ) {
            db
              .prepare(
                `INSERT INTO anomaly_log (
                  project_id,
                  issue_id,
                  anomaly_type,
                  severity,
                  details_json,
                  ai_analysis
                )
                VALUES (?, ?, 'translation_low_conf', 'warning', ?, ?)`
              )
              .run(
                item.project_id,
                item.issue_id,
                JSON.stringify({
                  translation_queue_id: item.id,
                  confidence: input.confidence,
                  threshold: config.translation.lowConfidenceThreshold,
                }),
                "Translation provider returned low confidence."
              );
          }

          refreshIssueTranslationStatus(db, item.issue_id);

          return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
        })
      );
    },

    markProviderError(queueId, errorCode) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE translation_queue
             SET provider_error = ?, updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(errorCode, queueId);

        return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
      });
    },

    updateSourceText(queueId, sourceText) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE translation_queue
             SET source_text = ?,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(sourceText, queueId);

        return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
      });
    },

    approve(queueId, input = {}) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const item = db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId);
          if (!item || !item.ai_draft) {
            return null;
          }

          db
            .prepare(
              `UPDATE translation_queue
               SET reviewed_text = ai_draft,
                   review_status = 'approved',
                   review_notes = ?,
                   reviewed_at = datetime('now'),
                   reviewed_by = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(input.review_notes || null, input.reviewed_by || null, queueId);

          if (item.comment_id) {
            db
              .prepare(
                `UPDATE issue_comments
                 SET content_translated = ?, updated_at = datetime('now')
                 WHERE id = ?`
              )
              .run(item.ai_draft, item.comment_id);
          }

          refreshIssueTranslationStatus(db, item.issue_id);
          return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
        })
      );
    },

    reject(queueId, input = {}) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const item = db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId);
          if (!item) {
            return null;
          }

          db
            .prepare(
              `UPDATE translation_queue
               SET review_status = 'rejected',
                   review_notes = ?,
                   reviewed_at = datetime('now'),
                   reviewed_by = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(input.review_notes || null, input.reviewed_by || null, queueId);

          refreshIssueTranslationStatus(db, item.issue_id);
          return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
        })
      );
    },

    manualEdit(queueId, input) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const item = db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId);
          if (!item) {
            return null;
          }

          db
            .prepare(
              `UPDATE translation_queue
               SET reviewed_text = ?,
                   review_status = 'edited',
                   review_notes = ?,
                   reviewed_at = datetime('now'),
                   reviewed_by = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(input.reviewed_text, input.review_notes || null, input.reviewed_by || null, queueId);

          if (item.comment_id) {
            db
              .prepare(
                `UPDATE issue_comments
                 SET content_translated = ?, updated_at = datetime('now')
                 WHERE id = ?`
              )
              .run(input.reviewed_text, item.comment_id);
          }

          refreshIssueTranslationStatus(db, item.issue_id);
          return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
        })
      );
    },

    resetForRetranslate(queueId) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const item = db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId);
          if (!item) {
            return null;
          }

          db
            .prepare(
              `UPDATE translation_queue
               SET review_status = ?,
                   provider_error = NULL,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(TRANSLATION_REVIEW_STATUSES.PENDING, queueId);

          refreshIssueTranslationStatus(db, item.issue_id);
          return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
        })
      );
    },
  };
}

module.exports = {
  createTranslationRepository,
  refreshIssueTranslationStatus,
  rowToTranslation,
};
