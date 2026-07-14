const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function saveJiraSyncResult({ config, issueId, input }) {
  const issue = createCisRepository({ config }).saveJiraSyncResult(issueId, input || {});

  if (!issue) {
    const existing = createCisRepository({ config }).getIssueById(issueId);
    if (existing) {
      throw new AppError({
        code: "EXTERNAL_LINK_CONFLICT",
        message: "Jira identity changed while the sync result was being saved.",
        status: 409,
      });
    }
    throw new AppError({
      code: "ISSUE_NOT_FOUND",
      message: "Issue not found.",
      status: 404,
    });
  }

  return issue;
}

module.exports = {
  saveJiraSyncResult,
};
