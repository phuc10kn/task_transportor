const { createConnection } = require("../../../infrastructure/database/connection");

function count(db, sql, params = []) {
  return Number(db.prepare(sql).get(...params).total || 0);
}

function createDashboardRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    summary(projectId) {
      return withDb((db) => ({
        health: {
          status: "ok",
          database: "ok",
        },
        counts: {
          pull_jobs_pending: count(
            db,
            "SELECT COUNT(*) AS total FROM sync_jobs WHERE project_id = ? AND job_type = 'manual_pull' AND status = 'pending'",
            [projectId]
          ),
          pull_jobs_failed: count(
            db,
            "SELECT COUNT(*) AS total FROM sync_jobs WHERE project_id = ? AND job_type = 'manual_pull' AND status = 'failed'",
            [projectId]
          ),
          translation_pending: count(
            db,
            "SELECT COUNT(*) AS total FROM translation_queue WHERE project_id = ? AND review_status IN ('pending', 'ai_draft')",
            [projectId]
          ),
          issue_pending_mapping: count(
            db,
            `SELECT COUNT(DISTINCT issue_id) AS total
             FROM anomaly_log
             WHERE project_id = ?
               AND anomaly_type = 'mapping_gap'
               AND status IN ('open', 'investigating')`,
            [projectId]
          ),
          sync_jobs_failed: count(
            db,
            "SELECT COUNT(*) AS total FROM sync_jobs WHERE project_id = ? AND status = 'failed'",
            [projectId]
          ),
          anomaly_open: count(
            db,
            "SELECT COUNT(*) AS total FROM anomaly_log WHERE project_id = ? AND status IN ('open', 'investigating')",
            [projectId]
          ),
          issues_total: count(db, "SELECT COUNT(*) AS total FROM issues WHERE project_id = ?", [projectId]),
        },
      }));
    },

    alerts(projectId) {
      return withDb((db) => {
        const failedJobs = db
          .prepare(
            `SELECT id, project_id, issue_id, job_type, last_error, updated_at
             FROM sync_jobs
             WHERE project_id = ? AND status = 'failed'
             ORDER BY updated_at DESC
             LIMIT 10`
          )
          .all(projectId)
          .map((row) => ({ type: "sync_job_failed", severity: "warning", ...row }));

        const anomalies = db
          .prepare(
            `SELECT id, project_id, issue_id, anomaly_type, severity, status, created_at
             FROM anomaly_log
             WHERE project_id = ? AND status IN ('open', 'investigating')
             ORDER BY created_at DESC
             LIMIT 10`
          )
          .all(projectId)
          .map((row) => ({ type: "anomaly_open", ...row }));

        return [...failedJobs, ...anomalies].slice(0, 20);
      });
    },
  };
}

module.exports = {
  createDashboardRepository,
};
