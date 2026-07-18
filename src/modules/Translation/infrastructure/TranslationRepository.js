const { createConnection } = require("../../../infrastructure/database/connection");
const { runInTransaction } = require("../../../infrastructure/database/transaction");
const { TRANSLATION_REVIEW_STATUSES } = require("../../../shared/stateConstants");
const {
  DEFAULT_TRANSLATION_AI_TRANSPORT,
} = require("../../../shared/translationModels");

function rowToTranslation(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    ai_transport: row.ai_transport || DEFAULT_TRANSLATION_AI_TRANSPORT,
  };
}

function createTranslationRepository({ config, db: providedDb = null }) {
  function withDb(callback) {
    if (providedDb) return callback(providedDb);
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

    findById(queueId, projectId) {
      return withDb((db) => rowToTranslation(projectId === undefined
        ? db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId)
        : db.prepare("SELECT * FROM translation_queue WHERE id = ? AND project_id = ?").get(queueId, projectId)));
    },

    deleteQueueItems(queueIds) {
      if (!Array.isArray(queueIds) || queueIds.length === 0) {
        return 0;
      }

      return withDb((db) => {
        const placeholders = queueIds.map(() => "?").join(", ");
        return db
          .prepare(`DELETE FROM translation_queue WHERE id IN (${placeholders})`)
          .run(...queueIds).changes;
      });
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

    updateAiConfig(queueId, input) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE translation_queue
             SET provider = ?,
                 ai_transport = ?,
                 model_or_command = ?,
                 provider_error = NULL,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(
            input.provider,
            input.ai_transport || null,
            input.model_or_command || null,
            queueId
          );

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
               SET reviewed_text = NULL,
                   review_status = 'approved',
                   review_notes = ?,
                   reviewed_at = datetime('now'),
                   reviewed_by = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(input.review_notes || null, input.reviewed_by || null, queueId);
          return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
        })
      );
    },

    approveBatchInTransaction(queueIds, input = {}) {
      if (!Array.isArray(queueIds) || queueIds.length === 0) return [];
      return withDb((db) => {
        const placeholders = queueIds.map(() => "?").join(", ");
        const rows = db.prepare(
          `SELECT * FROM translation_queue WHERE id IN (${placeholders}) ORDER BY id ASC`
        ).all(...queueIds);
        if (rows.length !== queueIds.length || rows.some((item) => !item.ai_draft)) return [];
        db.prepare(
          `UPDATE translation_queue
           SET reviewed_text = NULL,
               review_status = 'approved',
               review_notes = ?,
               reviewed_at = datetime('now'),
               reviewed_by = ?,
               updated_at = datetime('now')
           WHERE id IN (${placeholders})`
        ).run(input.review_notes || null, input.reviewed_by || null, ...queueIds);
        return db.prepare(
          `SELECT * FROM translation_queue WHERE id IN (${placeholders}) ORDER BY id ASC`
        ).all(...queueIds).map(rowToTranslation);
      });
    },

    restoreBatchInTransaction(snapshots) {
      if (!Array.isArray(snapshots) || snapshots.length === 0) return [];
      return withDb((db) => {
        const statement = db.prepare(
          `UPDATE translation_queue
           SET ai_draft = ?, reviewed_text = ?, review_status = ?, provider = ?,
               ai_transport = ?, model_or_command = ?, provider_request_id = ?, confidence = ?,
               provider_error = ?, review_notes = ?, reviewed_at = ?, reviewed_by = ?,
               updated_at = datetime('now')
           WHERE id = ?`
        );
        for (const item of snapshots) {
          statement.run(
            item.ai_draft || null,
            item.reviewed_text || null,
            item.review_status,
            item.provider,
            item.ai_transport || null,
            item.model_or_command || null,
            item.provider_request_id || null,
            item.confidence === undefined ? null : item.confidence,
            item.provider_error || null,
            item.review_notes || null,
            item.reviewed_at || null,
            item.reviewed_by || null,
            item.id
          );
        }
        const ids = snapshots.map((item) => item.id);
        const placeholders = ids.map(() => "?").join(", ");
        return db.prepare(`SELECT * FROM translation_queue WHERE id IN (${placeholders}) ORDER BY id ASC`)
          .all(...ids)
          .map(rowToTranslation);
      });
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
          return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
        })
      );
    },

    saveDraft(queueId, input) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const item = db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId);
          if (!item) {
            return null;
          }

          db
            .prepare(
              `UPDATE translation_queue
               SET source_text = COALESCE(?, source_text),
                   ai_draft = ?,
                   reviewed_text = NULL,
                   review_status = 'ai_draft',
                   review_notes = ?,
                   reviewed_at = NULL,
                   reviewed_by = NULL,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(input.source_text || null, input.draft_text, input.review_notes || null, queueId);
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
          return rowToTranslation(db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(queueId));
        })
      );
    },
  };
}

module.exports = {
  createTranslationRepository,
  rowToTranslation,
};
