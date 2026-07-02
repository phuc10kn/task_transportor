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
    summary() {
      return withDb((db) => ({
        health: {
          status: "ok",
          database: "ok",
        },
        counts: {
          pull_jobs_pending: count(
            db,
            "SELECT COUNT(*) AS total FROM sync_jobs WHERE job_type = 'manual_pull' AND status = 'pending'"
          ),
          pull_jobs_failed: count(
            db,
            "SELECT COUNT(*) AS total FROM sync_jobs WHERE job_type = 'manual_pull' AND status = 'failed'"
          ),
          translation_pending: count(
            db,
            "SELECT COUNT(*) AS total FROM translation_queue WHERE review_status IN ('pending', 'ai_draft')"
          ),
          issue_pending_mapping: count(
            db,
            `SELECT COUNT(DISTINCT issue_id) AS total
             FROM anomaly_log
             WHERE anomaly_type = 'mapping_gap'
               AND status IN ('open', 'investigating')`
          ),
          sync_jobs_failed: count(
            db,
            "SELECT COUNT(*) AS total FROM sync_jobs WHERE status = 'failed'"
          ),
          anomaly_open: count(
            db,
            "SELECT COUNT(*) AS total FROM anomaly_log WHERE status IN ('open', 'investigating')"
          ),
          projects_enabled: count(
            db,
            "SELECT COUNT(*) AS total FROM projects WHERE enabled = 1"
          ),
          issues_total: count(db, "SELECT COUNT(*) AS total FROM issues"),
        },
      }));
    },

    alerts() {
      return withDb((db) => {
        const failedJobs = db
          .prepare(
            `SELECT id, project_id, issue_id, job_type, last_error, updated_at
             FROM sync_jobs
             WHERE status = 'failed'
             ORDER BY updated_at DESC
             LIMIT 10`
          )
          .all()
          .map((row) => ({ type: "sync_job_failed", severity: "warning", ...row }));

        const anomalies = db
          .prepare(
            `SELECT id, project_id, issue_id, anomaly_type, severity, status, created_at
             FROM anomaly_log
             WHERE status IN ('open', 'investigating')
             ORDER BY created_at DESC
             LIMIT 10`
          )
          .all()
          .map((row) => ({ type: "anomaly_open", ...row }));

        return [...failedJobs, ...anomalies].slice(0, 20);
      });
    },
  };
}

module.exports = {
  createDashboardRepository,
};
