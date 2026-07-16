const { createConnection } = require("../../../infrastructure/database/connection");

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  return JSON.parse(value);
}

function rowToAnomaly(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    details_json: parseJson(row.details_json, {}),
  };
}

function detailsMatch(row, expected) {
  const details = parseJson(row.details_json, {});
  return Object.entries(expected).every(([key, value]) => details[key] === value);
}

function createAnomalyRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    create(input) {
      return withDb((db) => {
        const result = db
          .prepare(
            `INSERT INTO anomaly_log (
              project_id,
              issue_id,
              anomaly_type,
              severity,
              status,
              details_json,
              ai_analysis
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            input.project_id,
            input.issue_id || null,
            input.anomaly_type,
            input.severity,
            input.status || "open",
            JSON.stringify(input.details_json || {}),
            input.ai_analysis || null
          );

        return rowToAnomaly(db.prepare("SELECT * FROM anomaly_log WHERE id = ?").get(result.lastInsertRowid));
      });
    },

    list(filters = {}) {
      return withDb((db) => {
        const clauses = [];
        const values = [];

        for (const column of ["project_id", "issue_id", "anomaly_type", "severity", "status"]) {
          if (filters[column] !== undefined) {
            clauses.push(`${column} = ?`);
            values.push(filters[column]);
          }
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
        return db
          .prepare(`SELECT * FROM anomaly_log ${where} ORDER BY id ASC`)
          .all(...values)
          .map(rowToAnomaly);
      });
    },

    findById(anomalyId, projectId) {
      return withDb((db) => rowToAnomaly(projectId === undefined
        ? db.prepare("SELECT * FROM anomaly_log WHERE id = ?").get(anomalyId)
        : db.prepare("SELECT * FROM anomaly_log WHERE id = ? AND project_id = ?").get(anomalyId, projectId)));
    },

    findBlockingForIssue(issueId) {
      return withDb((db) =>
        db
          .prepare(
            `SELECT * FROM anomaly_log
             WHERE issue_id = ?
               AND severity = 'critical'
               AND status IN ('open', 'investigating')
             ORDER BY id ASC`
          )
          .all(issueId)
          .map(rowToAnomaly)
      );
    },

    findOpenMappingGap(input) {
      return withDb((db) => {
        const rows = db
          .prepare(
            `SELECT * FROM anomaly_log
             WHERE project_id = ?
               AND issue_id = ?
               AND anomaly_type = 'mapping_gap'
               AND status IN ('open', 'investigating')
             ORDER BY id ASC`
          )
          .all(input.project_id, input.issue_id);

        return rowToAnomaly(rows.find((row) => detailsMatch(row, input.details_json)) || null);
      });
    },

    transition(anomalyId, input) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE anomaly_log
             SET status = ?,
                 resolved_at = datetime('now'),
                 resolved_by = ?
             WHERE id = ?`
          )
          .run(input.status, input.resolved_by || null, anomalyId);

        return rowToAnomaly(db.prepare("SELECT * FROM anomaly_log WHERE id = ?").get(anomalyId));
      });
    },
  };
}

module.exports = {
  createAnomalyRepository,
  rowToAnomaly,
};
