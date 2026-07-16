const crypto = require("crypto");

const { createConnection } = require("../../../infrastructure/database/connection");
const { runImmediateTransaction, runInTransaction } = require("../../../infrastructure/database/transaction");
const { SYNC_JOB_STATUSES } = require("../../../shared/stateConstants");
const { insertJournal } = require("./SyncJournalRepository");
const { backoffMinutesForAttempt } = require("../support/backoff");
const { parseJson, stringifyJson } = require("../support/json");

function issueKeyForSystem(system, keys) {
  if (system === "backlog") {
    return keys.backlog || keys.payload.backlog_issue_key || keys.payload.source_issue_key || "";
  }

  if (system === "jira") {
    return keys.jira || keys.payload.jira_issue_key || keys.payload.target_issue_key || "";
  }

  if (system === "cis") {
    return keys.backlog || keys.jira || keys.payload.backlog_issue_key || keys.payload.jira_issue_key || "";
  }

  return "";
}

function rowToJob(row) {
  if (!row) {
    return null;
  }

  const {
    inferred_issue_id,
    issue_backlog_issue_key,
    issue_jira_issue_key,
    project_name,
    ...job
  } = row;
  const payload = parseJson(row.payload_json, {});
  const keys = {
    backlog: issue_backlog_issue_key || "",
    jira: issue_jira_issue_key || "",
    payload,
  };
  return {
    ...job,
    issue_id: job.issue_id || inferred_issue_id || null,
    project_name: project_name || null,
    issue_reference: issue_backlog_issue_key ||
      issue_jira_issue_key ||
      job.issue_id ||
      inferred_issue_id ||
      payload.backlog_issue_key ||
      payload.issue_id ||
      "",
    source_issue_key: issueKeyForSystem(job.direction_from, keys),
    target_issue_key: issueKeyForSystem(job.direction_to, keys),
    payload_json: payload,
  };
}

function jobJournalInput(job, overrides) {
  return {
    sync_job_id: job.id,
    project_id: job.project_id,
    issue_id: job.issue_id,
    comment_id: job.comment_id,
    attachment_id: job.attachment_id,
    direction_from: job.direction_from,
    direction_to: job.direction_to,
    job_type: job.job_type,
    attempt_count: job.attempt_count || 0,
    ...overrides,
  };
}

function syncJobSelectSql(where = "") {
  return `SELECT
            sync_jobs.*,
            projects.name AS project_name,
            (
              SELECT issue_id
              FROM sync_journal
              WHERE sync_journal.sync_job_id = sync_jobs.id
                AND sync_journal.issue_id IS NOT NULL
              ORDER BY sync_journal.id DESC
              LIMIT 1
            ) AS inferred_issue_id,
            issues.backlog_issue_key AS issue_backlog_issue_key,
            issues.jira_issue_key AS issue_jira_issue_key,
            (
              SELECT MAX(sync_journal.created_at)
              FROM sync_journal
              WHERE sync_journal.sync_job_id = sync_jobs.id
                AND sync_journal.action = 'job_success'
                AND sync_journal.status = 'success'
            ) AS success_at
          FROM sync_jobs
          LEFT JOIN projects ON projects.id = sync_jobs.project_id
          LEFT JOIN issues ON issues.id = COALESCE(
            sync_jobs.issue_id,
            (
              SELECT issue_id
              FROM sync_journal
              WHERE sync_journal.sync_job_id = sync_jobs.id
                AND sync_journal.issue_id IS NOT NULL
              ORDER BY sync_journal.id DESC
              LIMIT 1
            )
          )
          ${where}`;
}

function findActiveIssueJobInDb(db, issueId, jobType) {
  return rowToJob(db
    .prepare(
      `SELECT * FROM sync_jobs
       WHERE issue_id = ? AND job_type = ? AND status IN ('pending', 'running')
       ORDER BY created_at ASC LIMIT 1`
    )
    .get(issueId, jobType));
}

function insertJobInDb(db, input) {
  const id = input.id || crypto.randomUUID();
  db.prepare(
    `INSERT INTO sync_jobs (
      id, project_id, issue_id, comment_id, attachment_id,
      direction_from, direction_to, job_type, payload_json,
      dedupe_key, priority, max_attempts, run_after
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))`
  ).run(
    id,
    input.project_id,
    input.issue_id || null,
    input.comment_id || null,
    input.attachment_id || null,
    input.direction_from,
    input.direction_to,
    input.job_type,
    stringifyJson(input.payload_json),
    input.dedupe_key || null,
    input.priority === undefined ? 100 : input.priority,
    input.max_attempts || 3,
    input.run_after || null
  );
  const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(id);
  insertJournal(db, jobJournalInput(job, {
    action: "job_enqueued",
    status: "pending",
    trigger: input.trigger || "manual",
    message: "Job enqueued.",
    executed_by: input.executed_by || null,
    correlation_id: input.correlation_id || null,
  }));
  return rowToJob(job);
}

function createSyncJobRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    enqueue(input) {
      return withDb((db) =>
        runInTransaction(db, () => {
          if (input.dedupe_key) {
            const existing = db.prepare("SELECT * FROM sync_jobs WHERE dedupe_key = ?").get(input.dedupe_key);
            if (existing) {
              return rowToJob(existing);
            }
          }

          return insertJobInDb(db, input);
        })
      );
    },

    findActiveIssueJob(issueId, jobType) {
      return withDb((db) => findActiveIssueJobInDb(db, issueId, jobType));
    },

    enqueueManualPullIfNoneActive(input) {
      return withDb((db) => runImmediateTransaction(db, () => {
        const key = String(input.payload_json && input.payload_json.backlog_issue_key || "").trim().toUpperCase();
        const existing = db.prepare(
          `SELECT * FROM sync_jobs
           WHERE project_id = ?
             AND job_type IN ('manual_pull', 'sync_translate_jira')
             AND direction_from = 'backlog'
             AND status IN ('pending', 'running')
             AND UPPER(TRIM(json_extract(payload_json, '$.backlog_issue_key'))) = ?
           ORDER BY created_at ASC LIMIT 1`
        ).get(input.project_id, key);

        if (!existing) {
          return {
            job: insertJobInDb(db, input),
            reused: false,
            promoted: false,
            running_without_translation: false,
            running_without_jira: false,
          };
        }

        const currentPayload = parseJson(existing.payload_json, {});
        const wantsTranslation = input.payload_json && input.payload_json.with_translation === true;
        const hasTranslation = currentPayload.with_translation === true;
        const wantsJira = input.payload_json && input.payload_json.push_to_jira === true;
        const hasJira = existing.job_type === "sync_translate_jira" || currentPayload.push_to_jira === true;

        if (((wantsTranslation && !hasTranslation) || (wantsJira && !hasJira)) && existing.status === "pending") {
          const promotedPayload = {
            ...currentPayload,
            with_translation: hasTranslation || wantsTranslation || wantsJira,
            push_to_jira: hasJira || wantsJira,
            requested_by: input.payload_json.requested_by || null,
            request_correlation_id: input.payload_json.request_correlation_id || null,
          };
          db.prepare(
            `UPDATE sync_jobs
             SET payload_json = ?,
                 job_type = CASE WHEN ? = 1 THEN 'sync_translate_jira' ELSE job_type END,
                 direction_to = CASE WHEN ? = 1 THEN 'jira' ELSE direction_to END,
                 max_attempts = MAX(max_attempts, ?),
                 updated_at = datetime('now')
             WHERE id = ? AND status = 'pending'`
          ).run(
            stringifyJson(promotedPayload),
            wantsJira ? 1 : 0,
            wantsJira ? 1 : 0,
            input.max_attempts || existing.max_attempts,
            existing.id
          );
          const promotedJob = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(existing.id);
          insertJournal(db, jobJournalInput(promotedJob, {
            action: wantsJira && !hasJira ? "manual_pull_jira_promoted" : "manual_pull_translation_promoted",
            status: "pending",
            trigger: input.trigger || "manual",
            message: wantsJira && !hasJira
              ? "Manual pull was promoted to request translation and Jira delivery."
              : "Manual pull was promoted to request translation.",
            details_json: {
              with_translation: promotedPayload.with_translation,
              push_to_jira: promotedPayload.push_to_jira,
              requested_by: promotedPayload.requested_by,
              request_correlation_id: promotedPayload.request_correlation_id,
            },
            executed_by: input.executed_by || null,
            correlation_id: input.correlation_id || null,
          }));
          return {
            job: rowToJob(promotedJob),
            reused: true,
            promoted: true,
            running_without_translation: false,
            running_without_jira: false,
          };
        }

        return {
          job: rowToJob(existing),
          reused: true,
          promoted: false,
          running_without_translation: Boolean(wantsTranslation && !hasTranslation && existing.status === "running"),
          running_without_jira: Boolean(wantsJira && !hasJira && existing.status === "running"),
        };
      }));
    },

    enqueueTranslateJobIfNoneActive(input) {
      return withDb((db) => runImmediateTransaction(db, () => {
        const queueId = Number(input.payload_json && input.payload_json.translation_queue_id);
        const existing = db.prepare(
          `SELECT * FROM sync_jobs
           WHERE job_type = 'translate'
             AND status IN ('pending', 'running')
             AND json_extract(payload_json, '$.translation_queue_id') = ?
           ORDER BY created_at ASC LIMIT 1`
        ).get(queueId);

        if (existing) {
          return {
            job: rowToJob(existing),
            reused: true,
          };
        }

        return {
          job: insertJobInDb(db, input),
          reused: false,
        };
      }));
    },

    enqueueIssueJobIfNoneActive(input) {
      return withDb((db) => runImmediateTransaction(db, () => {
        const existing = findActiveIssueJobInDb(db, input.issue_id, input.job_type);
        if (existing) {
          return { job: existing, reused: true };
        }
        return { job: insertJobInDb(db, input), reused: false };
      }));
    },

    list(filters = {}) {
      return withDb((db) => {
        const clauses = [];
        const values = [];

        if (filters.status) {
          clauses.push("sync_jobs.status = ?");
          values.push(filters.status);
        }

        if (filters.project_id) {
          clauses.push("sync_jobs.project_id = ?");
          values.push(filters.project_id);
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

        return db
          .prepare(`${syncJobSelectSql(where)} ORDER BY sync_jobs.priority ASC, sync_jobs.run_after ASC, sync_jobs.created_at ASC`)
          .all(...values)
          .map(rowToJob);
      });
    },

    listPending(limit = 50) {
      return withDb((db) =>
        db
          .prepare(
            `SELECT sync_jobs.*
             FROM sync_jobs
             JOIN projects ON projects.id = sync_jobs.project_id
             WHERE sync_jobs.status = 'pending'
               AND sync_jobs.run_after <= datetime('now')
               AND projects.enabled = 1
               AND projects.sync_enabled = 1
             ORDER BY sync_jobs.priority ASC, sync_jobs.run_after ASC, sync_jobs.created_at ASC
             LIMIT ?`
          )
          .all(limit)
          .map(rowToJob)
      );
    },

    findById(id, projectId) {
      return withDb((db) => rowToJob(
        projectId
          ? db.prepare(syncJobSelectSql("WHERE sync_jobs.id = ? AND sync_jobs.project_id = ?")).get(id, projectId)
          : db.prepare(syncJobSelectSql("WHERE sync_jobs.id = ?")).get(id)
      ));
    },

    linkIssue(jobId, issueId) {
      return withDb((db) =>
        runInTransaction(db, () => {
          db
            .prepare(
              `UPDATE sync_jobs
               SET issue_id = COALESCE(issue_id, ?),
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(issueId, jobId);

          db
            .prepare(
              `UPDATE sync_journal
               SET issue_id = COALESCE(issue_id, ?)
               WHERE sync_job_id = ?`
            )
            .run(issueId, jobId);

          return rowToJob(
            db.prepare(syncJobSelectSql("WHERE sync_jobs.id = ?")).get(jobId)
          );
        })
      );
    },

    lockNext({ workerId, limit = 50 }) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const candidate = db
            .prepare(
              `SELECT sync_jobs.*
               FROM sync_jobs
               JOIN projects ON projects.id = sync_jobs.project_id
               WHERE sync_jobs.status = 'pending'
                 AND sync_jobs.run_after <= datetime('now')
                 AND projects.enabled = 1
                 AND projects.sync_enabled = 1
               ORDER BY sync_jobs.priority ASC, sync_jobs.run_after ASC, sync_jobs.created_at ASC
               LIMIT ?`
            )
            .all(limit)
            .at(0);

          if (!candidate) {
            return null;
          }

          const result = db
            .prepare(
              `UPDATE sync_jobs
               SET status = 'running',
                   locked_at = datetime('now'),
                   locked_by = ?,
                   attempt_count = attempt_count + 1,
                   updated_at = datetime('now')
               WHERE id = ? AND status = 'pending'`
            )
            .run(workerId, candidate.id);

          if (result.changes !== 1) {
            return null;
          }

          const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(candidate.id);
          insertJournal(db, jobJournalInput(job, {
            action: "job_locked",
            status: "running",
            trigger: "system",
            message: `Locked by ${workerId}.`,
          }));

          return rowToJob(job);
        })
      );
    },

    lockById({ jobId, workerId }) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const candidate = db
            .prepare(
              `SELECT sync_jobs.*
               FROM sync_jobs
               JOIN projects ON projects.id = sync_jobs.project_id
               WHERE sync_jobs.id = ?
                 AND sync_jobs.status = 'pending'
                 AND sync_jobs.run_after <= datetime('now')
                 AND projects.enabled = 1
                 AND projects.sync_enabled = 1`
            )
            .get(jobId);

          if (!candidate) {
            return null;
          }

          const result = db
            .prepare(
              `UPDATE sync_jobs
               SET status = 'running',
                   locked_at = datetime('now'),
                   locked_by = ?,
                   attempt_count = attempt_count + 1,
                   updated_at = datetime('now')
               WHERE id = ? AND status = 'pending'`
            )
            .run(workerId, candidate.id);

          if (result.changes !== 1) {
            return null;
          }

          const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(candidate.id);
          insertJournal(db, jobJournalInput(job, {
            action: "job_locked",
            status: "running",
            trigger: "manual",
            message: `Locked by ${workerId}.`,
          }));

          return rowToJob(job);
        })
      );
    },

    markSuccess(jobId, details = {}) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const existing = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(jobId);
          db
            .prepare(
              `UPDATE sync_jobs
               SET status = 'success',
                   locked_at = NULL,
                   locked_by = NULL,
                   last_error = NULL,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(jobId);

          const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(jobId);
          insertJournal(db, jobJournalInput(job, {
            action: "job_success",
            status: "success",
            trigger: "system",
            message: details.message || "Job completed.",
            details_json: details,
            attempt_count: existing ? existing.attempt_count : job.attempt_count,
          }));

          return rowToJob(job);
        })
      );
    },

    markFailed(jobId, error, options = {}) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const existing = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(jobId);
          if (!existing) {
            return null;
          }

          const retryable = Boolean(options.retryable);
          const retryAfterSeconds = options.retryAfterSeconds
            ? Number(options.retryAfterSeconds)
            : null;
          const shouldRetry = retryable && existing.attempt_count < existing.max_attempts;
          const nextStatus = shouldRetry ? "pending" : "failed";
          const backoff = backoffMinutesForAttempt(existing.attempt_count);
          const errorMessage = error && error.message ? error.message : String(error || "Job failed.");
          const retryOffset = retryAfterSeconds && retryAfterSeconds > 0
            ? `+${retryAfterSeconds} seconds`
            : `+${backoff} minutes`;

          db
            .prepare(
              `UPDATE sync_jobs
               SET status = ?,
                   run_after = CASE WHEN ? = 1 THEN datetime('now', ?) ELSE run_after END,
                   locked_at = NULL,
                   locked_by = NULL,
                   last_error = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(nextStatus, shouldRetry ? 1 : 0, retryOffset, errorMessage, jobId);

          const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(jobId);
          insertJournal(db, jobJournalInput(job, {
            action: shouldRetry ? "job_retry_scheduled" : "job_failed",
            status: shouldRetry ? "pending" : "failed",
            trigger: "system",
            error_message: errorMessage,
            details_json: {
              retryable,
              backoff_minutes: shouldRetry && !(retryAfterSeconds && retryAfterSeconds > 0) ? backoff : null,
              retry_after_seconds: shouldRetry && retryAfterSeconds && retryAfterSeconds > 0
                ? retryAfterSeconds
                : null,
            },
            attempt_count: existing.attempt_count,
          }));

          return rowToJob(job);
        })
      );
    },

    cancel(jobId, { executedBy = null } = {}) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const existing = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(jobId);
          if (!existing || existing.status !== SYNC_JOB_STATUSES.PENDING) {
            return null;
          }

          db
            .prepare(
              `UPDATE sync_jobs
               SET status = 'cancelled',
                   updated_at = datetime('now')
               WHERE id = ? AND status = 'pending'`
            )
            .run(jobId);

          const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(jobId);
          insertJournal(db, jobJournalInput(job, {
            action: "job_cancelled",
            status: "cancelled",
            trigger: "manual",
            executed_by: executedBy,
          }));

          return rowToJob(job);
        })
      );
    },

    cancelTranslateJobsForQueueIds(queueIds, { executedBy = null, trigger = "system", correlationId = null } = {}) {
      if (!Array.isArray(queueIds) || queueIds.length === 0) {
        return [];
      }

      return withDb((db) =>
        runInTransaction(db, () => {
          const placeholders = queueIds.map(() => "?").join(", ");
          const jobs = db
            .prepare(
              `SELECT *
               FROM sync_jobs
               WHERE job_type = 'translate'
                 AND status IN ('pending', 'running')
                 AND json_extract(payload_json, '$.translation_queue_id') IN (${placeholders})`
            )
            .all(...queueIds);

          for (const existing of jobs) {
            db
              .prepare(
                `UPDATE sync_jobs
                 SET status = 'cancelled',
                     locked_at = NULL,
                     locked_by = NULL,
                     updated_at = datetime('now')
                 WHERE id = ?`
              )
              .run(existing.id);

            const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(existing.id);
            insertJournal(db, jobJournalInput(job, {
              action: "job_cancelled",
              status: "cancelled",
              trigger,
              message: "Translate job cancelled by queue cleanup.",
              executed_by: executedBy,
              correlation_id: correlationId,
              attempt_count: existing.attempt_count,
            }));
          }

          return jobs.map((job) =>
            rowToJob(db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(job.id))
          );
        })
      );
    },

    retryFailed(jobId, { executedBy = null } = {}) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const existing = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(jobId);
          if (!existing || existing.status !== SYNC_JOB_STATUSES.FAILED) {
            return null;
          }

          db
            .prepare(
              `UPDATE sync_jobs
               SET status = 'pending',
                   run_after = datetime('now'),
                   locked_at = NULL,
                   locked_by = NULL,
                   last_error = NULL,
                   updated_at = datetime('now')
               WHERE id = ? AND status = 'failed'`
            )
            .run(jobId);

          const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(jobId);
          insertJournal(db, jobJournalInput(job, {
            action: "job_manual_retry",
            status: "pending",
            trigger: "manual",
            executed_by: executedBy,
          }));

          return rowToJob(job);
        })
      );
    },

    recoverStale({ workerId, lockTimeoutSeconds }) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const staleJobs = db
            .prepare(
              `SELECT *
               FROM sync_jobs
               WHERE status = 'running'
                 AND locked_at < datetime('now', ?)`
            )
            .all(`-${lockTimeoutSeconds} seconds`);

          const recovered = [];
          const failed = [];

          for (const existing of staleJobs) {
            const canRetry = existing.attempt_count < existing.max_attempts;
            const backoff = backoffMinutesForAttempt(existing.attempt_count);

            if (canRetry) {
              db
                .prepare(
                  `UPDATE sync_jobs
                   SET status = 'pending',
                       run_after = datetime('now', ?),
                       locked_at = NULL,
                       locked_by = NULL,
                       last_error = 'Recovered stale running job.',
                       updated_at = datetime('now')
                   WHERE id = ?`
                )
                .run(`+${backoff} minutes`, existing.id);
            } else {
              db
                .prepare(
                  `UPDATE sync_jobs
                   SET status = 'failed',
                       locked_at = NULL,
                       locked_by = NULL,
                       last_error = 'Stale running job exceeded max attempts.',
                       updated_at = datetime('now')
                   WHERE id = ?`
                )
                .run(existing.id);
            }

            const job = db.prepare("SELECT * FROM sync_jobs WHERE id = ?").get(existing.id);
            insertJournal(db, jobJournalInput(job, {
              action: canRetry ? "stale_recovered" : "stale_failed",
              status: canRetry ? "pending" : "failed",
              trigger: "system",
              message: `Recovered by ${workerId}.`,
              details_json: { lock_timeout_seconds: lockTimeoutSeconds, backoff_minutes: canRetry ? backoff : null },
              attempt_count: existing.attempt_count,
            }));

            (canRetry ? recovered : failed).push(rowToJob(job));
          }

          return { recovered, failed };
        })
      );
    },
  };
}

module.exports = {
  createSyncJobRepository,
  findActiveIssueJobInDb,
  insertJobInDb,
  rowToJob,
};
