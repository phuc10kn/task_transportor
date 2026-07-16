const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");
const {
  ISSUE_TRANSLATION_FIELDS,
  issueTranslationTargetMap,
  issueTranslationTargets,
} = require("../support/issueTranslationTargets");

function getIssueTranslationTargets({ config, issueId, db = null }) {
  const repository = createCisRepository({ config, db });
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
    fields: ISSUE_TRANSLATION_FIELDS,
    target_map: issueTranslationTargetMap(issue),
    targets: issueTranslationTargets(issue),
    translations: repository.listTranslationQueue(issue.id),
  };
}

module.exports = {
  getIssueTranslationTargets,
};
