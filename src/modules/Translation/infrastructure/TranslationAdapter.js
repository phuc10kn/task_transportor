const { AppError } = require("../../../http/errors/AppError");
const { hashText } = require("../support/hashText");
const { parseTranslationOutput } = require("../support/parseTranslationOutput");

function createPrompt(request) {
  return [
    "Translate the standardized CIS translation request.",
    "Return only JSON with translated_text, confidence, warnings, and preserved_blocks.",
    "Do not include markdown fences or commentary.",
    "Respect every mandatory request instruction.",
    "Mandatory request instructions:",
    ...(Array.isArray(request.instructions) ? request.instructions.map((instruction) => `- ${instruction}`) : []),
    "",
    JSON.stringify({
      source_language: request.source_language,
      target_language: request.target_language,
      source_text: request.source_text,
      context_bundle: request.context_bundle || {},
      instructions: request.instructions || [],
    }),
  ].join("\n");
}

function aiErrorIdentity(aiSource) {
  return aiSource === "openai"
    ? { code: "OPENAI", label: "OpenAI", key: "OPENAI_API_KEY" }
    : { code: "DEEPSEEK", label: "DeepSeek", key: "DEEPSEEK_API_KEY" };
}

function mapAiError(error, request, selectedModel, aiSource) {
  const identity = aiErrorIdentity(aiSource);
  const code = error && error.code === "AI_API_KEY_MISSING"
    ? `${identity.code}_API_KEY_MISSING`
    : error && error.code === "FETCH_UNAVAILABLE"
      ? "FETCH_UNAVAILABLE"
      : error && String(error.code || "").includes("TIMEOUT")
        ? `${identity.code}_TIMEOUT`
        : error && String(error.code || "").includes("HTTP_ERROR")
          ? `${identity.code}_HTTP_ERROR`
          : `${identity.code}_REQUEST_ERROR`;

  const appError = new AppError({
    code,
    message: code === `${identity.code}_API_KEY_MISSING`
      ? `${identity.key} is required for ${identity.label} translation.`
      : code === "FETCH_UNAVAILABLE"
        ? `Global fetch is required for ${identity.label} translation.`
        : code === `${identity.code}_TIMEOUT`
          ? `${identity.label} translation timed out.`
          : code === `${identity.code}_HTTP_ERROR`
            ? `${identity.label} translation returned an error response.`
            : `${identity.label} translation request failed.`,
    status: error && error.status ? error.status : 502,
    details: {
      ...(error && error.details ? error.details : {}),
      request_hash: hashText(request.source_text || ""),
      model: selectedModel,
    },
  });
  appError.retryable = error && error.retryable !== undefined ? error.retryable : true;
  return appError;
}

function createTranslationAdapter({ aiClient, aiSource, model }) {
  async function generateDraft(request) {
    const startedAt = Date.now();

    let response;
    try {
      response = await aiClient.createJsonChatCompletion({
        model,
        system: "You are a precise Japanese to Vietnamese translation engine for issue tracking data.",
        user: createPrompt(request),
        temperature: 0.2,
        thinking: { type: "disabled" },
      });
    } catch (error) {
      throw mapAiError(error, request, model, aiSource);
    }

    try {
      const parsed = parseTranslationOutput(response.content);
      return {
        ...parsed,
        provider: aiSource,
        model_or_command: model,
        provider_request_id: response.request_id || hashText(JSON.stringify(response.body || {})),
        duration_ms: Date.now() - startedAt,
      };
    } catch (error) {
      const identity = aiErrorIdentity(aiSource);
      error.code = error.code === "TRANSLATION_AI_PARSE_ERROR"
        ? `${identity.code}_PARSE_ERROR`
        : error.code === "TRANSLATION_AI_INVALID_OUTPUT"
          ? `${identity.code}_INVALID_OUTPUT`
          : error.code;
      error.message = error.code === `${identity.code}_PARSE_ERROR`
        ? `${identity.label} translation output was not valid JSON.`
        : error.message;
      error.retryable = true;
      throw error;
    }
  }

  return {
    generateDraft,
  };
}

module.exports = {
  createTranslationAdapter,
};
