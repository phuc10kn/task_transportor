const { AppError } = require("../../../http/errors/AppError");
const { translateQueueItemNow } = require("./translateQueueItemNow");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const CisApi = require("../../Cis/CisApi");

const ISSUE_TRANSLATION_FIELDS = ["summary", "description"];

function normalizeSource(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function inferTargetField(item, sources) {
  if (ISSUE_TRANSLATION_FIELDS.includes(item.target_field)) {
    return item.target_field;
  }

  const sourceText = normalizeSource(item.source_text);
  for (const field of ISSUE_TRANSLATION_FIELDS) {
    if (sourceText && sourceText === sources[field]) {
      return field;
    }
  }

  if (sourceText.includes("\n") || sourceText.length > 120) {
    return "description";
  }

  return null;
}

async function translateIssueTranslationNow({ config, issueId, queueId, executedBy, correlationId }) {
  const repository = createTranslationRepository({ config });
  const item = repository.findById(queueId);
  if (!item || item.issue_id !== issueId || item.target_type !== "issue" || item.comment_id) {
    throw new AppError({
      code: "TRANSLATION_QUEUE_NOT_FOUND",
      message: "Issue translation queue item was not found.",
      status: 404,
    });
  }

  const bundle = CisApi.getIssueTranslationTargets({ config, issueId });
  const sources = bundle.target_map || {};
  const targetField = inferTargetField(item, sources);
  const sourceText = targetField ? sources[targetField] : null;
  if (!sourceText) {
    throw new AppError({
      code: "ISSUE_TRANSLATION_SOURCE_REQUIRED",
      message: "Issue translation source must exist in CIS before translating.",
      status: 422,
    });
  }

  repository.updateSourceText(queueId, sourceText);
  repository.resetForRetranslate(queueId);

  const translated = await translateQueueItemNow({
    config,
    queueId,
    executedBy: executedBy || null,
    correlationId: correlationId || null,
    trigger: "manual",
  });

  return {
    item: repository.findById(queueId),
    translated,
  };
}

module.exports = {
  translateIssueTranslationNow,
};
