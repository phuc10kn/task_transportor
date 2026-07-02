const { buildStandardTranslationInput, contentTypeFor } = require("../application/buildStandardTranslationInput");

function buildTranslationRequest({ item, issue }) {
  return buildStandardTranslationInput({
    item,
    issue,
    context_policy: "default_translation",
    context_bundle: {},
  });
}

module.exports = {
  buildTranslationRequest,
  contentTypeFor,
};
