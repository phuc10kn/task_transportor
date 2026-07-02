const { AppError } = require("../../../http/errors/AppError");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");

function getTranslationQueueItem({ config, queueId }) {
  const item = createTranslationRepository({ config }).findById(queueId);

  if (!item) {
    throw new AppError({
      code: "TRANSLATION_QUEUE_NOT_FOUND",
      message: "Translation queue item was not found.",
      status: 404,
    });
  }

  return item;
}

module.exports = {
  getTranslationQueueItem,
};
