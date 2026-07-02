const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");
const { summarizeWorklogs } = require("./getIssueEditor");

function listIssueWorklogs({ config, issueId }) {
  const repository = createCisRepository({ config });
  const issue = repository.getIssueById(issueId);

  if (!issue) {
    throw new AppError({
      code: "ISSUE_NOT_FOUND",
      message: "Issue not found.",
      status: 404,
    });
  }

  const items = repository.listWorklogs(issue.id);

  return {
    issue_id: issue.id,
    items: items.map((item) => ({
      id: item.id,
      source: item.source_system,
      source_worklog_id: item.source_worklog_id,
      author: item.author,
      started_at: item.started_at,
      time_spent_seconds: item.time_spent_seconds,
      comment: item.comment,
      sync_status: item.sync_status,
    })),
    summary: summarizeWorklogs(items),
  };
}

module.exports = {
  listIssueWorklogs,
};
