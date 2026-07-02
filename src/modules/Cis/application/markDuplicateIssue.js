const { AppError } = require("../../../http/errors/AppError");
const { ISSUE_STATUSES } = require("../../../shared/stateConstants");
const { createCisRepository } = require("../infrastructure/CisRepository");

function markDuplicateIssue({ config, issueId }) {
  const repository = createCisRepository({ config });
  const issue = repository.updateIssueStatus(issueId, ISSUE_STATUSES.CONFLICT);

  if (!issue) {
    throw new AppError({
      code: "ISSUE_NOT_FOUND",
      message: "Issue not found.",
      status: 404,
    });
  }

  return issue;
}

module.exports = {
  markDuplicateIssue,
};
