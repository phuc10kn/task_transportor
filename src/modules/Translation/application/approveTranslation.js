const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");

function approveTranslation({ config, queueId, reviewedBy, reviewNotes, correlationId }) {
  const repository = createTranslationRepository({ config });
  const draft = repository.findById(queueId);
  if (!draft || !draft.ai_draft) {
    throw new AppError({
      code: "TRANSLATION_DRAFT_REQUIRED",
      message: "Translation draft is required before approval.",
      status: 422,
    });
  }
  if (!draft.comment_id && draft.target_type === "issue" && draft.target_field) {
    const currentSource = CisApi.getIssueTranslationTargets({ config, issueId: draft.issue_id }).target_map[draft.target_field];
    if (currentSource != null && String(currentSource).trim() !== String(draft.source_text || "").trim()) {
      throw new AppError({
        code: "TRANSLATION_SOURCE_STALE",
        message: "Source changed. Save the draft against the current source or retranslate before approval.",
        status: 409,
      });
    }
  }
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

  const canonicalApply = CisApi.applyReviewedIssueTranslation({
    config,
    item,
    text: item.ai_draft,
    executedBy: reviewedBy,
    correlationId,
    reason: "Apply approved issue translation.",
  });
  const commentApply = item.comment_id
    ? CisApi.applyReviewedCommentTranslation({
      config,
      commentId: item.comment_id,
      text: item.ai_draft,
    })
    : null;

  syncIssueTranslationState({
    config,
    repository,
    issueId: item.issue_id,
    correlationId,
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
  approveTranslation,
};
