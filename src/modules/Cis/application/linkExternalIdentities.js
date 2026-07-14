const { AppError } = require("../../../http/errors/AppError");
const { createConnection } = require("../../../infrastructure/database/connection");
const { runImmediateTransaction } = require("../../../infrastructure/database/transaction");
const SyncApi = require("../../Sync/SyncApi");
const { createCisRepository } = require("../infrastructure/CisRepository");

function backlogApi() { return require("../../Backlog/BacklogApi"); }
function jiraApi() { return require("../../Jira/JiraApi"); }
function token(value) { return String(value === undefined || value === null ? "" : value).trim().toUpperCase(); }

function syncInProgress(issue, activeJob) {
  return issue && issue.sync_status === "syncing" || Boolean(activeJob);
}

function assertFieldCanLink(issue, field, incoming) {
  const current = token(issue[field]);
  if (!incoming) return "skip";
  if (current === incoming) return "unchanged";
  if (current) {
    throw new AppError({
      code: "EXTERNAL_LINK_ALREADY_ASSIGNED",
      message: `${field} is already assigned.`,
      status: 409,
    });
  }
  return "verify";
}

async function linkExternalIdentities({ config, issueId, input, executedBy, correlationId }) {
  const requested = {
    backlog_issue_key: token(input && input.backlog_issue_key),
    jira_issue_key: token(input && input.jira_issue_key),
  };
  if (!requested.backlog_issue_key && !requested.jira_issue_key) {
    throw new AppError({ code: "VALIDATION_ERROR", message: "At least one external identity is required.", status: 422 });
  }

  const repository = createCisRepository({ config });
  const issue = repository.getIssueById(issueId);
  if (!issue) {
    throw new AppError({ code: "ISSUE_NOT_FOUND", message: "Issue not found.", status: 404 });
  }
  if (syncInProgress(issue, SyncApi.hasActiveIssueJob({ config, issueId, jobType: "push_issue" }))) {
    throw new AppError({ code: "ISSUE_SYNC_IN_PROGRESS", message: "Issue sync is in progress.", status: 409 });
  }

  const states = {
    backlog_issue_key: assertFieldCanLink(issue, "backlog_issue_key", requested.backlog_issue_key),
    jira_issue_key: assertFieldCanLink(issue, "jira_issue_key", requested.jira_issue_key),
  };
  const verified = {};
  if (states.backlog_issue_key === "verify") {
    verified.backlog = await backlogApi().lookupBacklogIssueIdentity({ config, projectId: issue.project_id, lookupToken: requested.backlog_issue_key });
  }
  if (states.jira_issue_key === "verify") {
    verified.jira = await jiraApi().lookupJiraIssueIdentity({ config, projectId: issue.project_id, lookupToken: requested.jira_issue_key });
  }
  if (!verified.backlog && !verified.jira) {
    return {
      outcome: "unchanged",
      issue_id: issue.id,
      changed_fields: [],
      external_identities: {
        backlog: issue.backlog_issue_key ? { key: issue.backlog_issue_key, id: null } : null,
        jira: issue.jira_issue_key ? { key: issue.jira_issue_key, id: null } : null,
      },
    };
  }

  const db = createConnection({ config });
  try {
    const updated = runImmediateTransaction(db, () => {
      const txRepo = createCisRepository({ config, db });
      const current = txRepo.getIssueById(issue.id);
      const active = SyncApi.hasActiveIssueJobInTransaction({ db, issueId: issue.id, jobType: "push_issue" });
      if (syncInProgress(current, active)) {
        throw new AppError({ code: "ISSUE_SYNC_IN_PROGRESS", message: "Issue sync is in progress.", status: 409 });
      }
      for (const [field, identity] of [["backlog_issue_key", verified.backlog], ["jira_issue_key", verified.jira]]) {
        if (!identity) continue;
        if (current[field]) {
          throw new AppError({ code: "EXTERNAL_LINK_CONFLICT", message: "External identity changed during verification.", status: 409 });
        }
        const owners = field === "backlog_issue_key"
          ? txRepo.getIssuesByBacklogKeys(current.project_id, [identity.canonical_key])
          : txRepo.getIssuesByJiraKey(current.project_id, identity.canonical_key);
        if (owners.length > 1) {
          throw new AppError({ code: "EXTERNAL_IDENTITY_DATA_CONFLICT", message: "Multiple legacy CIS issues use this external identity.", status: 409, details: { field } });
        }
        if (owners.some((owner) => owner.id !== current.id)) {
          throw new AppError({ code: "EXTERNAL_LINK_DUPLICATE", message: "External identity already belongs to another CIS issue in this project.", status: 409, details: { field } });
        }
      }
      const saved = txRepo.linkExternalIdentityRows(issue.id, {
        backlog_issue_key: verified.backlog && verified.backlog.canonical_key,
        jira_issue_key: verified.jira && verified.jira.canonical_key,
      });
      SyncApi.writeJournalInTransaction({
        db,
        input: {
          project_id: current.project_id,
          issue_id: current.id,
          direction_from: "cis",
          direction_to: "cis",
          job_type: "identity_link",
          action: "issue_external_identity_linked",
          status: "success",
          trigger: "manual",
          message: "External identity linked to CIS issue.",
          details_json: {
            backlog: verified.backlog || null,
            jira: verified.jira || null,
          },
          executed_by: executedBy || null,
          correlation_id: correlationId || null,
        },
      });
      return saved;
    });
    const changedFields = [verified.backlog && "backlog_issue_key", verified.jira && "jira_issue_key"].filter(Boolean);
    return {
      outcome: "linked",
      issue_id: updated.id,
      changed_fields: changedFields,
      external_identities: {
        backlog: updated.backlog_issue_key ? { key: updated.backlog_issue_key, id: verified.backlog && verified.backlog.external_id || null } : null,
        jira: updated.jira_issue_key ? { key: updated.jira_issue_key, id: verified.jira && verified.jira.external_id || null } : null,
      },
    };
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new AppError({ code: "EXTERNAL_LINK_CONFLICT", message: "External identity was linked concurrently.", status: 409 });
    }
    throw error;
  } finally {
    db.close();
  }
}

module.exports = { linkExternalIdentities };
