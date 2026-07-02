const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function listIssueHistory({ config, issueId }) {
  const repository = createCisRepository({ config });
  const issue = repository.getIssueById(issueId);

  if (!issue) {
    throw new AppError({
      code: "ISSUE_NOT_FOUND",
      message: "Issue not found.",
      status: 404,
    });
  }

  return {
    issue_id: issue.id,
    revisions: repository.listRevisions(issue.id),
    manual_edits: repository.listManualEditJournal(issue.id),
    worklog_events: [],
  };
}

module.exports = {
  listIssueHistory,
};
