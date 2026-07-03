const { AppError } = require("../../../http/errors/AppError");
const { hashText } = require("../support/hashText");
const { parseCodexExecOutput } = require("../support/parseCodexExecOutput");

function createPrompt(request) {
  return [
    "Translate the standardized CIS translation request.",
    "Return only JSON with translated_text, confidence, warnings, and preserved_blocks.",
    "Do not include markdown fences or commentary.",
    "Respect all preservation instructions and the project glossary.",
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

function mapAiError(error, request, selectedModel) {
  const code = error && error.code === "AI_API_KEY_MISSING"
    ? "DEEPSEEK_API_KEY_MISSING"
    : error && error.code === "FETCH_UNAVAILABLE"
      ? "FETCH_UNAVAILABLE"
      : error && String(error.code || "").includes("TIMEOUT")
        ? "DEEPSEEK_TIMEOUT"
        : error && String(error.code || "").includes("HTTP_ERROR")
          ? "DEEPSEEK_HTTP_ERROR"
          : "DEEPSEEK_REQUEST_ERROR";

  const appError = new AppError({
    code,
    message: code === "DEEPSEEK_API_KEY_MISSING"
      ? "DEEPSEEK_API_KEY is required for DeepSeek translation."
      : code === "FETCH_UNAVAILABLE"
        ? "Global fetch is required for DeepSeek translation."
        : code === "DEEPSEEK_TIMEOUT"
          ? "DeepSeek translation timed out."
          : code === "DEEPSEEK_HTTP_ERROR"
            ? "DeepSeek translation returned an error response."
            : "DeepSeek translation request failed.",
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
      throw mapAiError(error, request, model);
    }

    try {
      const parsed = parseCodexExecOutput(response.content);
      return {
        ...parsed,
        provider: aiSource,
        model_or_command: model,
        provider_request_id: response.request_id || hashText(JSON.stringify(response.body || {})),
        duration_ms: Date.now() - startedAt,
      };
    } catch (error) {
      error.code = error.code === "CODEX_EXEC_PARSE_ERROR"
        ? "DEEPSEEK_PARSE_ERROR"
        : error.code === "CODEX_EXEC_INVALID_OUTPUT"
          ? "DEEPSEEK_INVALID_OUTPUT"
          : error.code;
      error.message = error.code === "DEEPSEEK_PARSE_ERROR"
        ? "DeepSeek translation output was not valid JSON."
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
