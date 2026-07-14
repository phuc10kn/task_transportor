const { AppError } = require("../../../http/errors/AppError");
const { createConnection } = require("../../../infrastructure/database/connection");
const { runImmediateTransaction } = require("../../../infrastructure/database/transaction");
const SyncApi = require("../../Sync/SyncApi");
const { createCisRepository } = require("../infrastructure/CisRepository");

function claimJiraIdentityForSync({ config, issueId, jiraIssueKey, syncJobId }) {
  const key = String(jiraIssueKey || "").trim().toUpperCase();
  const db = createConnection({ config });
  try {
    return runImmediateTransaction(db, () => {
      const repository = createCisRepository({ config, db });
      const issue = repository.getIssueById(issueId);
      if (!issue) throw new AppError({ code: "ISSUE_NOT_FOUND", message: "Issue not found.", status: 404 });
      if (issue.jira_issue_key) {
        if (String(issue.jira_issue_key).trim().toUpperCase() === key) return issue;
        throw new AppError({ code: "JIRA_TRACE_STATE_CHANGED", message: "Jira identity changed before trace claim.", status: 409 });
      }
      const owners = repository.getIssuesByJiraKey(issue.project_id, key);
      if (owners.length > 0) {
        throw new AppError({ code: "EXTERNAL_LINK_DUPLICATE", message: "Jira trace target belongs to another CIS issue.", status: 409 });
      }
      const saved = repository.linkExternalIdentityRows(issue.id, { jira_issue_key: key });
      SyncApi.writeJournalInTransaction({
        db,
        input: {
          sync_job_id: syncJobId || null,
          project_id: issue.project_id,
          issue_id: issue.id,
          direction_from: "cis",
          direction_to: "jira",
          job_type: "push_issue",
          action: "jira_trace_linked",
          status: "success",
          trigger: "system",
          message: "Verified Jira trace identity linked before update.",
          details_json: { jira_issue_key: key },
        },
      });
      return saved;
    });
  } finally {
    db.close();
  }
}

module.exports = { claimJiraIdentityForSync };
