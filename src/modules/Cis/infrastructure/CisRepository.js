const crypto = require("crypto");

const { createConnection } = require("../../../infrastructure/database/connection");
const { runImmediateTransaction, runInTransaction } = require("../../../infrastructure/database/transaction");
const { ISSUE_STATUSES } = require("../../../shared/stateConstants");
const {
  DEFAULT_TRANSLATION_AI_PROVIDER,
  DEFAULT_TRANSLATION_AI_TRANSPORT,
  TRANSLATION_AI_PROVIDERS,
  TRANSLATION_AI_TRANSPORTS,
  defaultTranslationAiModelFor,
} = require("../../../shared/translationModels");
const { materializeCisFields, mergeSourceFields } = require("../support/materializeCisFields");

const CIS_PRIORITY_SQL = "json_extract(issues.fields_json, '$.priority.cis')";
const CIS_ASSIGNEE_SQL = "json_extract(issues.fields_json, '$.assignee.cis')";

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  return JSON.parse(value);
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
    fields_json: parseJson(row.fields_json, {}),
  };
}

function rowToTranslation(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    ai_transport: row.ai_transport ||
      (row.provider === TRANSLATION_AI_PROVIDERS.CODEX_EXEC
        ? TRANSLATION_AI_TRANSPORTS.PROCESS_EXEC
        : DEFAULT_TRANSLATION_AI_TRANSPORT),
  };
}

function rowToComment(row) {
  return row || null;
}

function rowToAttachment(row) {
  return row || null;
}

function rowToWorklog(row) {
  return row || null;
}

function buildIssueFilters(filters = {}) {
  const clauses = [];
  const values = [];

  if (filters.project_id) {
    clauses.push("issues.project_id = ?");
    values.push(filters.project_id);
  }

  if (filters.q) {
    clauses.push("instr(normalize_text_key(COALESCE(issue_revisions.summary, '')), normalize_text_key(?)) > 0");
    values.push(filters.q);
  }

  return {
    values,
    where: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
  };
}

function sourceFieldSnapshot(input) {
  return {
    summary: input.summary,
    description: input.description,
    issue_type: input.issue_type,
    priority: input.priority,
    assignee: input.assignee,
    due_date: input.due_date,
    story_point: input.story_point,
  };
}

function revisionFieldsJson(existingFieldsJson, input) {
  const sourceSystem = input.source_system || "manual";
  const fields = JSON.parse(JSON.stringify(existingFieldsJson || {}));

  for (const [field, value] of Object.entries(sourceFieldSnapshot(input))) {
    if (value === undefined || value === null) {
      continue;
    }

    const current = fields[field] && typeof fields[field] === "object" && !Array.isArray(fields[field])
      ? { ...fields[field] }
      : {};
    const targetSource = sourceSystem === "manual" || sourceSystem === "ai" ? "cis" : sourceSystem;
    current[targetSource] = value;
    fields[field] = current;
  }

  return materializeCisFields(fields);
}

function updateCanonicalIssueInDb(db, input) {
  const issue = rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(input.issue_id));
  if (!issue) return null;
  const nextRevision = input.revision_snapshot
    ? Number(issue.current_revision || 0) + 1
    : null;

  if (input.revision_snapshot) {
    const revisionFields = input.revision_snapshot.fields_json ||
      revisionFieldsJson(input.fields_json || issue.fields_json, {
        source_system: "manual",
        summary: input.revision_snapshot.summary,
        description: input.revision_snapshot.description,
        issue_type: input.revision_snapshot.issue_type,
        priority: input.revision_snapshot.priority,
        assignee: input.revision_snapshot.assignee,
      });
    db.prepare(
      `INSERT INTO issue_revisions (
        issue_id, revision, source_system, source_event_id, summary, description,
        issue_type, priority, assignee, fields_json, attachments_json
      ) VALUES (?, ?, 'manual', ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      issue.id,
      nextRevision,
      input.source_event_id || null,
      input.revision_snapshot.summary,
      input.revision_snapshot.description || null,
      input.revision_snapshot.issue_type || null,
      input.revision_snapshot.priority || null,
      input.revision_snapshot.assignee || null,
      JSON.stringify(revisionFields),
      JSON.stringify(input.revision_snapshot.attachments_json || [])
    );
  }

  db.prepare(
    `UPDATE issues
     SET fields_json = ?, sync_status = ?, current_revision = COALESCE(?, current_revision),
         updated_at = datetime('now')
     WHERE id = ?`
  ).run(JSON.stringify(input.fields_json || {}), input.sync_status, nextRevision, issue.id);
  return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issue.id));
}

function createCisRepository({ config, db: providedDb = null }) {
  function withDb(callback) {
    if (providedDb) {
      return callback(providedDb);
    }
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    createIssue(input) {
      return withDb((db) => {
        const id = input.id || crypto.randomUUID();
        const fieldsJson = materializeCisFields(input.fields_json || {});
        db
          .prepare(
            `INSERT INTO issues (
              id,
              project_id,
              backlog_issue_key,
              jira_issue_key,
              source_system,
              sync_status,
              fields_json,
              backlog_hash,
              jira_hash,
              backlog_updated_at,
              jira_updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            id,
            input.project_id,
            input.backlog_issue_key || null,
            input.jira_issue_key || null,
            input.source_system || "manual",
            input.sync_status || input.status || ISSUE_STATUSES.INGESTED,
            JSON.stringify(fieldsJson),
            input.backlog_hash || null,
            input.jira_hash || null,
            input.backlog_updated_at || null,
            input.jira_updated_at || null
          );

        return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(id));
      });
    },

    addRevision(input) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const issue = rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(input.issue_id));
          if (!issue) {
            throw new Error(`Issue not found: ${input.issue_id}`);
          }

          const nextRevision = Number(issue.current_revision || 0) + 1;
          const revisionFields = revisionFieldsJson(issue.fields_json, input);
          const result = db
            .prepare(
              `INSERT INTO issue_revisions (
                issue_id,
                revision,
                source_system,
                source_event_id,
                summary,
                description,
                issue_type,
                priority,
                assignee,
                fields_json,
                attachments_json
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .run(
              input.issue_id,
              nextRevision,
              input.source_system || "manual",
              input.source_event_id || null,
              input.summary,
              input.description || null,
              input.issue_type || null,
              input.priority || null,
              input.assignee || null,
              JSON.stringify(revisionFields),
              JSON.stringify(input.attachments_json || [])
            );

          db
            .prepare(
              `UPDATE issues
               SET current_revision = ?,
                   fields_json = ?,
                   updated_at = datetime('now')
               WHERE id = ?`
            )
            .run(
              nextRevision,
              JSON.stringify(revisionFields),
              input.issue_id
            );

          return rowToRevision(
            db.prepare("SELECT * FROM issue_revisions WHERE id = ?").get(result.lastInsertRowid)
          );
        })
      );
    },

    listRevisions(issueId) {
      return withDb((db) =>
        db
          .prepare("SELECT * FROM issue_revisions WHERE issue_id = ? ORDER BY revision ASC")
          .all(issueId)
          .map(rowToRevision)
      );
    },

    listManualEditJournal(issueId) {
      return withDb((db) =>
        db
          .prepare(
            `SELECT *
             FROM sync_journal
             WHERE issue_id = ?
               AND action = 'issue_manual_edit_saved'
             ORDER BY id ASC`
          )
          .all(issueId)
          .map((row) => ({
            ...row,
            details_json: parseJson(row.details_json, {}),
          }))
      );
    },

    listIssues(filters = {}) {
      return withDb((db) => {
        const { values, where } = buildIssueFilters(filters);
        const page = Number(filters.page) || 1;
        const pageSize = Number(filters.page_size) || 20;
        const join = `FROM issues
             JOIN projects ON projects.id = issues.project_id
             LEFT JOIN issue_revisions
               ON issue_revisions.issue_id = issues.id
              AND issue_revisions.revision = issues.current_revision`;
        const items = db
          .prepare(
            `SELECT
               issues.*,
               projects.name AS project_name,
               issue_revisions.summary AS current_summary,
               issue_revisions.description AS current_description,
               issue_revisions.issue_type AS current_issue_type,
               ${CIS_PRIORITY_SQL} AS current_priority,
               ${CIS_ASSIGNEE_SQL} AS current_assignee,
               (
                 SELECT COUNT(*)
                 FROM translation_queue
                 WHERE translation_queue.issue_id = issues.id
                   AND translation_queue.review_status IN ('pending', 'ai_draft')
               ) AS pending_translation_count,
               (
                 SELECT COUNT(*)
                 FROM anomaly_log
                 WHERE anomaly_log.issue_id = issues.id
                   AND anomaly_log.status IN ('open', 'investigating')
               ) AS open_anomaly_count
             ${join}
             ${where}
             ORDER BY issues.updated_at DESC, issues.created_at DESC
             LIMIT ? OFFSET ?`
          )
          .all(...values, pageSize, (page - 1) * pageSize)
          .map(rowToIssue);
        const total = db.prepare(`SELECT COUNT(*) AS total ${join} ${where}`).get(...values).total;
        return {
          items,
          pagination: {
            page,
            page_size: pageSize,
            total,
            total_pages: Math.max(1, Math.ceil(total / pageSize)),
          },
        };
      });
    },

    createTranslationQueueItem(input) {
      return withDb((db) => {
        const project = db
          .prepare(
            `SELECT
               translation_ai_provider,
               translation_ai_transport,
               translation_ai_model,
               translation_provider,
               translation_model,
               translation_command_profile
             FROM projects
             WHERE id = ?`
          )
          .get(input.project_id) || {};
        const provider = input.provider ||
          project.translation_ai_provider ||
          project.translation_provider ||
          DEFAULT_TRANSLATION_AI_PROVIDER;
        const aiTransport = input.ai_transport ||
          project.translation_ai_transport ||
          (provider === TRANSLATION_AI_PROVIDERS.CODEX_EXEC
            ? TRANSLATION_AI_TRANSPORTS.PROCESS_EXEC
            : DEFAULT_TRANSLATION_AI_TRANSPORT);
        const modelOrCommand = input.model_or_command ||
          project.translation_ai_model ||
          project.translation_model ||
          project.translation_command_profile ||
          defaultTranslationAiModelFor(provider);
        const result = db
          .prepare(
            `INSERT INTO translation_queue (
              project_id,
              issue_id,
              comment_id,
              target_type,
              target_field,
              source_language,
              target_language,
              source_text,
              provider,
              model_or_command,
              ai_transport
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            input.project_id,
            input.issue_id,
            input.comment_id || null,
            input.target_type || "issue",
            input.target_field || null,
            input.source_language || "ja",
            input.target_language || "vi",
            input.source_text,
            provider,
            modelOrCommand,
            aiTransport
          );

        return rowToTranslation(
          db.prepare("SELECT * FROM translation_queue WHERE id = ?").get(result.lastInsertRowid)
        );
      });
    },

    upsertBacklogIssue(normalized) {
      normalized = {
        ...normalized,
        backlog_issue_key: String(normalized.backlog_issue_key || "").trim().toUpperCase(),
      };
      return withDb((db) =>
        runImmediateTransaction(db, () => {
          const existing = db
            .prepare("SELECT * FROM issues WHERE project_id = ? AND UPPER(TRIM(backlog_issue_key)) = ?")
            .get(normalized.project_id, normalized.backlog_issue_key);

          if (existing && (existing.sync_status || existing.status) === ISSUE_STATUSES.SYNCING) {
            const error = new Error("Issue is currently syncing to Jira.");
            error.code = "ISSUE_SYNC_IN_PROGRESS";
            error.status = 409;
            error.retryable = true;
            throw error;
          }

          let issue;
          let createdIssue = false;
          let createdRevision = false;
          let currentFieldsJson;
          const createdTranslationItems = [];

          if (!existing) {
            const issueId = crypto.randomUUID();
            currentFieldsJson = materializeCisFields(normalized.fields_json || {});
            db
              .prepare(
                `INSERT INTO issues (
                  id,
                  project_id,
                  backlog_issue_key,
                  source_system,
                  sync_status,
                  fields_json,
                  backlog_hash,
                  backlog_updated_at
                )
                VALUES (?, ?, ?, 'backlog', ?, ?, ?, ?)`
              )
              .run(
                issueId,
                normalized.project_id,
                normalized.backlog_issue_key,
                ISSUE_STATUSES.INGESTED,
                JSON.stringify(currentFieldsJson),
                normalized.payload_hash,
                normalized.backlog_updated_at || null
              );
            issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
            createdIssue = true;
          } else {
            issue = rowToIssue(existing);
            currentFieldsJson = mergeSourceFields(issue.fields_json, normalized.fields_json || {}, "backlog");
            db
              .prepare(
                `UPDATE issues
                 SET fields_json = ?,
                     backlog_updated_at = ?,
                     updated_at = datetime('now')
                 WHERE id = ?`
              )
              .run(
                JSON.stringify(currentFieldsJson),
                normalized.backlog_updated_at || null,
                issue.id
              );
          }

          if (!existing || existing.backlog_hash !== normalized.payload_hash) {
            const nextRevision = Number(issue.current_revision || 0) + 1;
            const revisionFields = revisionFieldsJson(currentFieldsJson, {
              source_system: "backlog",
              summary: normalized.summary,
              description: normalized.description,
              issue_type: normalized.issue_type,
              priority: normalized.priority,
              assignee: normalized.assignee,
            });
            db
              .prepare(
                `INSERT INTO issue_revisions (
                  issue_id,
                  revision,
                  source_system,
                  source_event_id,
                  summary,
                  description,
                  issue_type,
                  priority,
                  assignee,
                  fields_json,
                  attachments_json
                )
                VALUES (?, ?, 'backlog', ?, ?, ?, ?, ?, ?, ?, ?)`
              )
              .run(
                issue.id,
                nextRevision,
                normalized.source_event_id || null,
                normalized.summary,
                normalized.description || null,
                normalized.issue_type || null,
                normalized.priority || null,
                normalized.assignee || null,
                JSON.stringify(revisionFields),
                JSON.stringify(normalized.attachments || [])
              );
            db
              .prepare(
                `UPDATE issues
                 SET current_revision = ?,
                     backlog_hash = ?,
                     sync_status = ?,
                     updated_at = datetime('now')
                 WHERE id = ?`
              )
              .run(
                nextRevision,
                normalized.payload_hash,
                createdIssue ? ISSUE_STATUSES.INGESTED : ISSUE_STATUSES.UPDATE_PENDING,
                issue.id
              );
            createdRevision = true;
          }

          issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(issue.id);

          const upsertedComments = [];
          for (const comment of normalized.comments || []) {
            const existingComment = db
              .prepare("SELECT * FROM issue_comments WHERE issue_id = ? AND backlog_comment_id = ?")
              .get(issue.id, comment.backlog_comment_id);

            let commentRow;
            if (existingComment) {
              db
                .prepare(
                  `UPDATE issue_comments
                   SET content_original = ?,
                       author_name = ?,
                       created_at_source = ?,
                       updated_at = datetime('now')
                   WHERE id = ?`
                )
                .run(
                  comment.content_original,
                  comment.author_name || null,
                  comment.created_at_source || null,
                  existingComment.id
                );
              commentRow = db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(existingComment.id);
            } else {
              const commentId = crypto.randomUUID();
              db
                .prepare(
                  `INSERT INTO issue_comments (
                    id,
                    project_id,
                    issue_id,
                    backlog_comment_id,
                    source_system,
                    content_original,
                    author_name,
                    created_at_source
                  )
                  VALUES (?, ?, ?, ?, 'backlog', ?, ?, ?)`
                )
                .run(
                  commentId,
                  normalized.project_id,
                  issue.id,
                  comment.backlog_comment_id,
                  comment.content_original,
                  comment.author_name || null,
                  comment.created_at_source || null
                );
              commentRow = db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(commentId);
            }

            upsertedComments.push(rowToComment(commentRow));
          }

          const upsertedAttachments = [];
          for (const attachment of normalized.attachments || []) {
            const existingAttachment = db
              .prepare(
                `SELECT * FROM issue_attachments
                 WHERE issue_id = ? AND source_system = 'backlog' AND backlog_attachment_id = ?`
              )
              .get(issue.id, attachment.backlog_attachment_id);

            let attachmentRow;
            if (existingAttachment) {
              db
                .prepare(
                  `UPDATE issue_attachments
                   SET original_filename = ?,
                       mime_type = ?,
                       size_bytes = ?,
                       created_at_source = ?,
                       updated_at = datetime('now')
                   WHERE id = ?`
                )
                .run(
                  attachment.original_filename,
                  attachment.mime_type || null,
                  attachment.size_bytes || null,
                  attachment.created_at_source || null,
                  existingAttachment.id
                );
              attachmentRow = db.prepare("SELECT * FROM issue_attachments WHERE id = ?").get(existingAttachment.id);
            } else {
              const attachmentId = crypto.randomUUID();
              db
                .prepare(
                  `INSERT INTO issue_attachments (
                    id,
                    project_id,
                    issue_id,
                    comment_id,
                    source_system,
                    backlog_attachment_id,
                    original_filename,
                    mime_type,
                    size_bytes,
                    download_status,
                    sync_status,
                    created_at_source
                  )
                  VALUES (?, ?, ?, ?, 'backlog', ?, ?, ?, ?, 'pending', 'pending', ?)`
                )
                .run(
                  attachmentId,
                  normalized.project_id,
                  issue.id,
                  attachment.comment_id || null,
                  attachment.backlog_attachment_id,
                  attachment.original_filename,
                  attachment.mime_type || null,
                  attachment.size_bytes || null,
                  attachment.created_at_source || null
                );
              attachmentRow = db.prepare("SELECT * FROM issue_attachments WHERE id = ?").get(attachmentId);
            }

            upsertedAttachments.push(rowToAttachment(attachmentRow));
          }

          return {
            issue: rowToIssue(issue),
            created_issue: createdIssue,
            created_revision: createdRevision,
            comments: upsertedComments,
            attachments: upsertedAttachments,
            created_translation_items: createdTranslationItems,
          };
        })
      );
    },

    getIssueByBacklogKey(projectId, backlogIssueKey) {
      return withDb((db) => rowToIssue(
        db
          .prepare("SELECT * FROM issues WHERE project_id = ? AND UPPER(TRIM(backlog_issue_key)) = ?")
          .get(projectId, String(backlogIssueKey || "").trim().toUpperCase())
      ));
    },

    getIssuesByBacklogKeys(projectId, backlogIssueKeys) {
      const keys = [...new Set((backlogIssueKeys || []).map((key) => String(key || "").trim().toUpperCase()).filter(Boolean))];
      if (keys.length === 0) {
        return [];
      }
      return withDb((db) => db.prepare(
        `SELECT * FROM issues
         WHERE project_id = ? AND UPPER(TRIM(backlog_issue_key)) IN (${keys.map(() => "?").join(", ")})`
      ).all(projectId, ...keys).map(rowToIssue));
    },

    getIssuesByJiraKey(projectId, jiraIssueKey) {
      return withDb((db) => db.prepare(
        "SELECT * FROM issues WHERE project_id = ? AND UPPER(TRIM(jira_issue_key)) = ?"
      ).all(projectId, String(jiraIssueKey || "").trim().toUpperCase()).map(rowToIssue));
    },

    createManualIssueRow(input) {
      return withDb((db) => {
        const id = input.id || crypto.randomUUID();
        const fieldsJson = materializeCisFields(input.fields_json || {});
        db.prepare(
          `INSERT INTO issues (id, project_id, source_system, sync_status, current_revision, fields_json)
           VALUES (?, ?, 'manual', ?, 1, ?)`
        ).run(id, input.project_id, ISSUE_STATUSES.INGESTED, JSON.stringify(fieldsJson));
        db.prepare(
          `INSERT INTO issue_revisions (
            issue_id, revision, source_system, summary, description,
            issue_type, priority, assignee, fields_json, attachments_json
          ) VALUES (?, 1, 'manual', ?, ?, ?, ?, ?, ?, '[]')`
        ).run(
          id,
          input.summary,
          input.description || null,
          input.issue_type || null,
          input.priority || null,
          input.assignee || null,
          JSON.stringify(fieldsJson)
        );
        return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(id));
      });
    },

    linkExternalIdentityRows(issueId, input) {
      return withDb((db) => {
        db.prepare(
          `UPDATE issues
           SET backlog_issue_key = COALESCE(?, backlog_issue_key),
               jira_issue_key = COALESCE(?, jira_issue_key),
               updated_at = datetime('now')
           WHERE id = ?`
        ).run(input.backlog_issue_key || null, input.jira_issue_key || null, issueId);
        return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
      });
    },

    getIssueById(issueId, projectId) {
      return withDb((db) => rowToIssue(
        projectId
          ? db.prepare("SELECT * FROM issues WHERE id = ? AND project_id = ?").get(issueId, projectId)
          : db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId)
      ));
    },

    listComments(issueId) {
      return withDb((db) =>
        db.prepare("SELECT * FROM issue_comments WHERE issue_id = ? ORDER BY created_at_cis ASC").all(issueId)
      );
    },

    listAttachments(issueId) {
      return withDb((db) =>
        db.prepare("SELECT * FROM issue_attachments WHERE issue_id = ? ORDER BY created_at_cis ASC").all(issueId)
      );
    },

    listWorklogs(issueId) {
      return withDb((db) =>
        db.prepare("SELECT * FROM issue_worklogs WHERE issue_id = ? ORDER BY started_at ASC, created_at_cis ASC").all(issueId)
          .map(rowToWorklog)
      );
    },

    getAttachmentById(attachmentId, projectId) {
      return withDb((db) => rowToAttachment(
        projectId
          ? db.prepare(
            `SELECT issue_attachments.*
             FROM issue_attachments
             JOIN issues ON issues.id = issue_attachments.issue_id
             WHERE issue_attachments.id = ? AND issues.project_id = ?`
          ).get(attachmentId, projectId)
          : db.prepare("SELECT * FROM issue_attachments WHERE id = ?").get(attachmentId)
      ));
    },

    listTranslationQueue(issueId) {
      return withDb((db) =>
        db.prepare("SELECT * FROM translation_queue WHERE issue_id = ? ORDER BY id ASC").all(issueId)
      );
    },

    updateIssueStatus(issueId, status, options = {}) {
      return withDb((db) => {
        const excludedStatuses = Array.isArray(options.exclude_statuses)
          ? options.exclude_statuses.filter(Boolean)
          : [];
        const where = excludedStatuses.length > 0
          ? `WHERE id = ? AND sync_status NOT IN (${excludedStatuses.map(() => "?").join(", ")})`
          : "WHERE id = ?";

        db
          .prepare(
            `UPDATE issues
             SET sync_status = ?, updated_at = datetime('now')
             ${where}`
          )
          .run(status, issueId, ...excludedStatuses);

        return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
      });
    },

    saveJiraDraftFields(issueId, input) {
      return withDb((db) =>
        runInTransaction(db, () => {
          const existing = rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
          if (!existing) {
            return null;
          }

          const fieldsJson = mergeSourceFields(existing.fields_json, {
            summary: input.summary ? { jira: input.summary } : undefined,
            description: input.description ? { jira: input.description } : undefined,
            issue_type: input.issue_type ? { jira: input.issue_type } : undefined,
            priority: input.priority ? { jira: input.priority } : undefined,
            status: input.status ? { jira: input.status } : undefined,
            assignee: input.assignee ? { jira: input.assignee } : undefined,
            due_date: input.due_date ? { jira: input.due_date } : undefined,
            story_point: input.story_point !== undefined && input.story_point !== null ? { jira: input.story_point } : undefined,
          }, "jira");

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

    saveJiraDraftFieldsInTransaction(issueId, input) {
      return withDb((db) => {
        const existing = rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
        if (!existing) return null;
        const fieldsJson = mergeSourceFields(existing.fields_json, {
          summary: input.summary ? { jira: input.summary } : undefined,
          description: input.description ? { jira: input.description } : undefined,
          issue_type: input.issue_type ? { jira: input.issue_type } : undefined,
          priority: input.priority ? { jira: input.priority } : undefined,
          status: input.status ? { jira: input.status } : undefined,
          assignee: input.assignee ? { jira: input.assignee } : undefined,
          due_date: input.due_date ? { jira: input.due_date } : undefined,
          story_point: input.story_point !== undefined && input.story_point !== null ? { jira: input.story_point } : undefined,
        }, "jira");
        db.prepare("UPDATE issues SET fields_json = ?, updated_at = datetime('now') WHERE id = ?")
          .run(JSON.stringify(fieldsJson), issueId);
        return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
      });
    },

    saveJiraSyncResult(issueId, input) {
      return withDb((db) =>
        runImmediateTransaction(db, () => {
          const existing = rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
          if (!existing) {
            return null;
          }

          const fieldsJson = mergeSourceFields(existing.fields_json, {
            summary: input.summary ? { jira: input.summary } : undefined,
            description: input.description ? { jira: input.description } : undefined,
            issue_type: input.issue_type ? { jira: input.issue_type } : undefined,
            priority: input.priority ? { jira: input.priority } : undefined,
            status: input.status ? { jira: input.status } : undefined,
            assignee: input.assignee ? { jira: input.assignee } : undefined,
            due_date: input.due_date ? { jira: input.due_date } : undefined,
            story_point: input.story_point !== undefined && input.story_point !== null ? { jira: input.story_point } : undefined,
            reporter: input.reporter ? { jira: input.reporter } : undefined,
          }, "jira");

          const updateResult = db
            .prepare(
              `UPDATE issues
               SET jira_issue_key = ?,
                   sync_status = ?,
                   last_synced_at = datetime('now'),
                   jira_updated_at = datetime('now'),
                   fields_json = ?,
                   updated_at = datetime('now')
               WHERE id = ?
                 AND ((? IS NULL AND jira_issue_key IS NULL)
                   OR UPPER(TRIM(jira_issue_key)) = UPPER(TRIM(?)))`
            )
            .run(
              input.jira_issue_key,
              input.issue_status || "synced",
              JSON.stringify(fieldsJson),
              issueId,
              input.expected_jira_issue_key || null,
              input.expected_jira_issue_key || null
            );

          if (updateResult.changes !== 1) {
            return null;
          }

          return rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId));
        })
      );
    },

    updateCommentTranslation(commentId, translatedText) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE issue_comments
             SET content_translated = ?,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(translatedText, commentId);

        return rowToComment(db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(commentId));
      });
    },

    markCommentJiraSynced(commentId, jiraCommentId) {
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

        return rowToComment(db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(commentId));
      });
    },

    markCommentJiraSyncFailed(commentId) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE issue_comments
             SET sync_status = 'failed',
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(commentId);

        return rowToComment(db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(commentId));
      });
    },

    updateCanonicalIssue(input) {
      return withDb((db) => runInTransaction(db, () => updateCanonicalIssueInDb(db, input)));
    },

    updateCanonicalIssueInTransaction(input) {
      return withDb((db) => updateCanonicalIssueInDb(db, input));
    },

    markAttachmentDownloaded(attachmentId, input) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE issue_attachments
             SET stored_path = ?,
                 sha256 = ?,
                 size_bytes = ?,
                 mime_type = COALESCE(?, mime_type),
                 download_status = 'downloaded',
                 error_message = NULL,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(
            input.stored_path,
            input.sha256,
            input.size_bytes,
            input.mime_type || null,
            attachmentId
          );

        return rowToAttachment(db.prepare("SELECT * FROM issue_attachments WHERE id = ?").get(attachmentId));
      });
    },

    markAttachmentDownloadFailed(attachmentId, errorMessage) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE issue_attachments
             SET download_status = 'failed',
                 error_message = ?,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(errorMessage, attachmentId);

        return rowToAttachment(db.prepare("SELECT * FROM issue_attachments WHERE id = ?").get(attachmentId));
      });
    },
  };
}

module.exports = {
  createCisRepository,
  rowToAttachment,
  rowToComment,
  rowToIssue,
  rowToRevision,
  rowToTranslation,
  rowToWorklog,
};
