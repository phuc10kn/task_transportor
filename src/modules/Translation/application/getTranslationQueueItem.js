const { AppError } = require("../../../http/errors/AppError");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");

function getTranslationQueueItem({ config, queueId, projectId }) {
  const item = createTranslationRepository({ config }).findById(queueId, projectId);

  if (!item) {
    throw new AppError({
      code: projectId === undefined ? "TRANSLATION_QUEUE_NOT_FOUND" : "RESOURCE_NOT_FOUND",
      message: "Translation queue item was not found.",
      status: 404,
    });
  }

  return {
    ...item,
    reviewed_text: undefined,
  };
}

module.exports = {
  getTranslationQueueItem,
};
