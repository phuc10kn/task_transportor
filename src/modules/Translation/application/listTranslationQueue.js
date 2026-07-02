const { createTranslationRepository } = require("../infrastructure/TranslationRepository");

function listTranslationQueue({ config, filters = {} }) {
  return createTranslationRepository({ config }).list(filters);
}

module.exports = {
  listTranslationQueue,
};
