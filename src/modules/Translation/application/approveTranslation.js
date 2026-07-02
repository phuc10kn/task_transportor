const { AppError } = require("../../../http/errors/AppError");
const SyncApi = require("../../Sync/SyncApi");
const { applyIssueTranslationToCanonical } = require("./applyIssueTranslationToCanonical");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");

function approveTranslation({ config, queueId, reviewedBy, reviewNotes, correlationId }) {
  const repository = createTranslationRepository({ config });
  const item = repository.approve(queueId, {
    reviewed_by: reviewedBy,
    review_notes: reviewNotes,
  });

  if (!item) {
    throw new AppError({
      code: "TRANSLATION_DRAFT_REQUIRED",
      message: "Translation draft is required before approval.",
      status: 422,
    });
  }

  const canonicalApply = applyIssueTranslationToCanonical({
    config,
    item,
    text: item.reviewed_text,
    executedBy: reviewedBy,
    correlationId,
    reason: "Apply approved issue translation.",
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
      action: "translation_approved",
      status: "success",
      trigger: "manual",
      message: "Translation draft approved.",
      details_json: { translation_queue_id: item.id, canonical_apply: canonicalApply },
      executed_by: reviewedBy,
      correlation_id: correlationId,
    },
  });

  return item;
}

module.exports = {
  approveTranslation,
};
