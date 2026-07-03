const { AppError } = require("../../../http/errors/AppError");
const SyncApi = require("../../Sync/SyncApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");

function rejectTranslation({ config, queueId, reviewedBy, reviewNotes, correlationId }) {
  const repository = createTranslationRepository({ config });
  const item = repository.reject(queueId, {
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

  SyncApi.writeJournal({
    config,
    input: {
      project_id: item.project_id,
      issue_id: item.issue_id,
      comment_id: item.comment_id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "translate",
      action: "translation_rejected",
      status: "success",
      trigger: "manual",
      message: "Translation draft rejected.",
      details_json: { translation_queue_id: item.id },
      executed_by: reviewedBy,
      correlation_id: correlationId,
    },
  });

  return item;
}

module.exports = {
  rejectTranslation,
};
