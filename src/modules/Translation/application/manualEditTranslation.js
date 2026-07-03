const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");

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

  syncIssueTranslationState({
    config,
    repository,
    issueId: item.issue_id,
    correlationId,
  });
  const canonicalApply = CisApi.applyReviewedIssueTranslation({
    config,
    item,
    text: item.reviewed_text,
    executedBy: reviewedBy,
    correlationId,
    reason: "Apply reviewed issue translation.",
  });
  const commentApply = item.comment_id
    ? CisApi.applyReviewedCommentTranslation({
      config,
      commentId: item.comment_id,
      text: item.reviewed_text,
    })
    : null;

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
      details_json: {
        translation_queue_id: item.id,
        canonical_apply: canonicalApply,
        comment_apply: commentApply,
      },
      executed_by: reviewedBy,
      correlation_id: correlationId,
    },
  });

  return item;
}

module.exports = {
  manualEditTranslation,
};
