function createManualTranslationProvider() {
  async function translate(request) {
    return {
      translated_text: request.source_text,
      confidence: 0,
      warnings: ["manual_fallback_required"],
      preserved_blocks: true,
      provider: "manual",
      model_or_command: "manual",
      provider_request_id: null,
      duration_ms: 0,
    };
  }

  return {
    translate,
  };
}

module.exports = {
  createManualTranslationProvider,
};
