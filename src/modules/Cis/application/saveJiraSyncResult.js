const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function saveJiraSyncResult({ config, issueId, input }) {
  const issue = createCisRepository({ config }).saveJiraSyncResult(issueId, input || {});

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
  saveJiraSyncResult,
};
