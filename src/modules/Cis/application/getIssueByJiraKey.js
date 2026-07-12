const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function getIssueByJiraKey({ config, projectId, jiraIssueKey }) {
  const issues = createCisRepository({ config }).getIssuesByJiraKey(Number(projectId), jiraIssueKey);
  if (issues.length > 1) {
    throw new AppError({
      code: "EXTERNAL_IDENTITY_DATA_CONFLICT",
      message: "Multiple CIS issues use the same Jira identity.",
      status: 409,
    });
  }
  return issues[0] || null;
}

module.exports = { getIssueByJiraKey };
