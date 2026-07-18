const { AppError } = require("../../../../http/errors/AppError");
const { createOpenAiCompatibleChatClient } = require("../../transports/openai-compatible/OpenAiCompatibleChatClient");
const { TRANSLATION_AI_TRANSPORTS } = require("../../../../shared/translationModels");

function unsupportedTransport(transport) {
  const error = new AppError({
    code: "TRANSLATION_AI_TRANSPORT_UNSUPPORTED",
    message: "Translation AI transport is not supported for the selected provider.",
    status: 422,
    details: { ai_provider: "openai", transport },
  });
  error.retryable = false;
  return error;
}

function createOpenAiGateway({ config, transport }) {
  if (transport !== TRANSLATION_AI_TRANSPORTS.OPENAI_COMPATIBLE) {
    throw unsupportedTransport(transport);
  }
  return createOpenAiCompatibleChatClient({
    apiKey: config.translation.openAiApiKey,
    baseUrl: config.translation.openAiBaseUrl,
    timeoutSeconds: config.translation.openAiRequestTimeoutSeconds,
    includeThinking: false,
  });
}

module.exports = { createOpenAiGateway };
