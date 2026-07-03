const { AppError } = require("../../../http/errors/AppError");
const SyncApi = require("../../Sync/SyncApi");
const { refreshTranslationAiConfigForQueueItem } = require("./refreshTranslationAiConfigForQueueItem");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");

function retranslateTranslation({ config, queueId, executedBy, correlationId }) {
  const repository = createTranslationRepository({ config });
  let item = repository.resetForRetranslate(queueId);

  if (!item) {
    throw new AppError({
      code: "TRANSLATION_QUEUE_NOT_FOUND",
      message: "Translation queue item was not found.",
      status: 404,
    });
  }

  item = refreshTranslationAiConfigForQueueItem({ config, repository, item });

  const job = SyncApi.enqueueJob({
    config,
    input: {
      project_id: item.project_id,
      issue_id: item.issue_id,
      comment_id: item.comment_id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "translate",
      payload_json: {
        translation_queue_id: item.id,
        mode: "retranslate",
      },
      priority: 50,
      trigger: "manual",
      executed_by: executedBy,
      correlation_id: correlationId,
    },
  });

  SyncApi.writeJournal({
    config,
    input: {
      sync_job_id: job.id,
      project_id: item.project_id,
      issue_id: item.issue_id,
      comment_id: item.comment_id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "translate",
      action: "translation_retranslate_requested",
      status: "pending",
      trigger: "manual",
      message: "Translation retranslate job requested.",
      details_json: { translation_queue_id: item.id },
      executed_by: executedBy,
      correlation_id: correlationId,
    },
  });

  return { item, job };
}

module.exports = {
  retranslateTranslation,
};
