const { AppError } = require("../../../http/errors/AppError");
const SyncApi = require("../../Sync/SyncApi");
const { applyIssueTranslationToCanonical } = require("./applyIssueTranslationToCanonical");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");

function manualEditTranslation({ config, queueId, reviewedText, reviewedBy, reviewNotes, correlationId }) {
  if (!reviewedText || typeof reviewedText !== "string") {
    throw new AppError({
      code: "TRANSLATION_REVIEWED_TEXT_REQUIRED",
      message: "reviewed_text is required for manual edit.",
      status: 422,
    });
  }

  const repository = createTranslationRepository({ config });
  const item = repository.manualEdit(queueId, {
    reviewed_text: reviewedText,
    reviewed_by: reviewedBy,
    review_notes: reviewNotes,
  });

  if (!item) {
    throw new AppError({
      code: "TRANSLATION_QUEUE_NOT_FOUND",
      message: "Translation queue item was not found.",
      status: 404,
    });
  }

  const canonicalApply = applyIssueTranslationToCanonical({
    config,
    item,
    text: item.reviewed_text,
    executedBy: reviewedBy,
    correlationId,
    reason: "Apply reviewed issue translation.",
  });

  SyncApi.writeJournal({
    config,
    input: {
      project_id: item.project_id,
      issue_id: item.issue_id,
      comment_id: item.comment_id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "translate",
      action: "translation_manual_edited",
      status: "success",
      trigger: "manual",
      message: "Translation manually edited.",
      details_json: { translation_queue_id: item.id, canonical_apply: canonicalApply },
      executed_by: reviewedBy,
      correlation_id: correlationId,
    },
  });

  return item;
}

module.exports = {
  manualEditTranslation,
};
