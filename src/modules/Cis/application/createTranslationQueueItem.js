const { createCisRepository } = require("../infrastructure/CisRepository");

function createTranslationQueueItem({ config, input }) {
  return createCisRepository({ config }).createTranslationQueueItem(input);
}

module.exports = {
  createTranslationQueueItem,
};
