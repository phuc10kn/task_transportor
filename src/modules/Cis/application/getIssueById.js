const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function getIssueById({ config, issueId, projectId }) {
  const issue = createCisRepository({ config }).getIssueById(issueId, projectId);

  if (!issue) {
    throw new AppError({
      code: projectId ? "RESOURCE_NOT_FOUND" : "ISSUE_NOT_FOUND",
      message: "Issue not found.",
      status: 404,
    });
  }

  return issue;
}

module.exports = {
  getIssueById,
};
