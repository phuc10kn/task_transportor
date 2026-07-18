const { createConnection } = require("../../../infrastructure/database/connection");
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

function targetIssueKey(system, keys) {
  return system === "jira" ? issueKeyForSystem(system, keys) || null : null;
}

function rowToJournal(row) {
  if (!row) {
    return null;
  }

  const {
    inferred_issue_id,
    issue_backlog_issue_key,
    issue_jira_issue_key,
    job_issue_id,
    job_payload_json,
    project_name,
    ...journal
  } = row;
  const jobPayload = parseJson(job_payload_json, {});
  const keys = {
    backlog: issue_backlog_issue_key || "",
    jira: issue_jira_issue_key || "",
    payload: jobPayload,
  };
  const issueReference = issue_backlog_issue_key ||
    issue_jira_issue_key ||
    journal.issue_id ||
    inferred_issue_id ||
    job_issue_id ||
    jobPayload.backlog_issue_key ||
    jobPayload.issue_id ||
    "";

  return {
    ...journal,
    details_json: parseJson(row.details_json, {}),
    issue_id: journal.issue_id || inferred_issue_id || job_issue_id || null,
    issue_reference: issueReference,
    source_issue_key: issueKeyForSystem(journal.direction_from, keys),
    target_issue_key: targetIssueKey(journal.direction_to, keys),
    project_name: project_name || null,
    success_at: row.status === "success" ? row.created_at : null,
  };
}

function insertJournal(db, input) {
  const result = db
    .prepare(
      `INSERT INTO sync_journal (
        sync_job_id,
        project_id,
        issue_id,
        comment_id,
        attachment_id,
        direction_from,
        direction_to,
        job_type,
        action,
        status,
        trigger,
        message,
        details_json,
        error_message,
        attempt_count,
        executed_by,
        correlation_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.sync_job_id || null,
      input.project_id,
      input.issue_id || null,
      input.comment_id || null,
      input.attachment_id || null,
      input.direction_from,
      input.direction_to,
      input.job_type || null,
      input.action,
      input.status,
      input.trigger || "auto",
      input.message || null,
      stringifyJson(input.details_json),
      input.error_message || null,
      input.attempt_count || 0,
      input.executed_by || null,
      input.correlation_id || null
    );

  return rowToJournal(db.prepare("SELECT * FROM sync_journal WHERE id = ?").get(result.lastInsertRowid));
}

function createSyncJournalRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    write(input) {
      return withDb((db) => insertJournal(db, input));
    },

    list(filters = {}) {
      return withDb((db) => {
        const clauses = [];
        const values = [];

        if (filters.sync_job_id) {
          clauses.push("sync_journal.sync_job_id = ?");
          values.push(filters.sync_job_id);
        }

        if (filters.issue_id) {
          clauses.push("sync_journal.issue_id = ?");
          values.push(filters.issue_id);
        }

        if (filters.project_id) {
          clauses.push("sync_journal.project_id = ?");
          values.push(filters.project_id);
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

        return db
          .prepare(
            `SELECT
               sync_journal.*,
               projects.name AS project_name,
               (
                 SELECT issue_id
                 FROM sync_journal AS linked_journal
                 WHERE linked_journal.sync_job_id = sync_journal.sync_job_id
                   AND linked_journal.issue_id IS NOT NULL
                 ORDER BY linked_journal.id DESC
                 LIMIT 1
               ) AS inferred_issue_id,
               issues.backlog_issue_key AS issue_backlog_issue_key,
               issues.jira_issue_key AS issue_jira_issue_key,
               sync_jobs.issue_id AS job_issue_id,
               sync_jobs.payload_json AS job_payload_json
             FROM sync_journal
             LEFT JOIN sync_jobs ON sync_jobs.id = sync_journal.sync_job_id
             LEFT JOIN issues ON issues.id = COALESCE(
               sync_journal.issue_id,
               sync_jobs.issue_id,
               (
                 SELECT issue_id
                 FROM sync_journal AS linked_journal
                 WHERE linked_journal.sync_job_id = sync_journal.sync_job_id
                   AND linked_journal.issue_id IS NOT NULL
                 ORDER BY linked_journal.id DESC
                 LIMIT 1
               )
             )
             LEFT JOIN projects ON projects.id = sync_journal.project_id
             ${where}
             ORDER BY sync_journal.id ASC`
          )
          .all(...values)
          .map(rowToJournal);
      });
    },
  };
}

module.exports = {
  createSyncJournalRepository,
  insertJournal,
  rowToJournal,
};
