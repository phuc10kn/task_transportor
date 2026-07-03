const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function markIssueSyncStatus({ config, issueId, status, excludeStatuses = [] }) {
  const issue = createCisRepository({ config }).updateIssueStatus(issueId, status, {
    exclude_statuses: excludeStatuses,
  });

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
  markIssueSyncStatus,
};
