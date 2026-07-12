const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function getIssueByBacklogKey({ config, projectId, backlogIssueKey }) {
  const issues = createCisRepository({ config }).getIssuesByBacklogKeys(projectId, [backlogIssueKey]);
  if (issues.length > 1) {
    throw new AppError({
      code: "EXTERNAL_IDENTITY_DATA_CONFLICT",
      message: "Multiple CIS issues use the same Backlog identity.",
      status: 409,
    });
  }
  return issues[0] || null;
}

module.exports = {
  getIssueByBacklogKey,
};
