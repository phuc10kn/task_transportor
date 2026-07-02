const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function getIssueDetail({ config, issueId }) {
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
    issue,
    revisions: repository.listRevisions(issue.id),
    comments: repository.listComments(issue.id),
    attachments: repository.listAttachments(issue.id),
    translations: repository.listTranslationQueue(issue.id),
  };
}

module.exports = {
  getIssueDetail,
};
