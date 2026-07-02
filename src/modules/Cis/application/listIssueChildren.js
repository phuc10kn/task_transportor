const { createCisRepository } = require("../infrastructure/CisRepository");

function listIssueChildren({ config, issueId }) {
  const repository = createCisRepository({ config });

  return {
    comments: repository.listComments(issueId),
    attachments: repository.listAttachments(issueId),
    translations: repository.listTranslationQueue(issueId),
    revisions: repository.listRevisions(issueId),
  };
}

module.exports = {
  listIssueChildren,
};
