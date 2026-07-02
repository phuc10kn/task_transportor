const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function getIssueById({ config, issueId }) {
  const issue = createCisRepository({ config }).getIssueById(issueId);

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
  getIssueById,
};
