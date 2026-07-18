const { AppError } = require("../../../../http/errors/AppError");
const { createAnthropicCompatibleMessagesClient } = require("../../transports/anthropic-compatible/AnthropicCompatibleMessagesClient");
const { createOpenAiCompatibleChatClient } = require("../../transports/openai-compatible/OpenAiCompatibleChatClient");
const { TRANSLATION_AI_TRANSPORTS } = require("../../../../shared/translationModels");

function unsupportedTransport(transport) {
  const error = new AppError({
    code: "TRANSLATION_AI_TRANSPORT_UNSUPPORTED",
    message: "Translation AI transport is not supported for the selected provider.",
    status: 422,
    details: { ai_provider: "deepseek", transport },
  });
  error.retryable = false;
  return error;
}

function createDeepSeekGateway({ config, transport }) {
  if (transport === TRANSLATION_AI_TRANSPORTS.OPENAI_COMPATIBLE) {
    return createOpenAiCompatibleChatClient({
      apiKey: config.translation.deepSeekApiKey,
      baseUrl: config.translation.deepSeekOpenAiBaseUrl || config.translation.deepSeekBaseUrl,
      timeoutSeconds: config.translation.deepSeekRequestTimeoutSeconds,
    });
  }
  if (transport === TRANSLATION_AI_TRANSPORTS.ANTHROPIC_COMPATIBLE) {
    return createAnthropicCompatibleMessagesClient({
      apiKey: config.translation.deepSeekApiKey,
      baseUrl: config.translation.deepSeekAnthropicBaseUrl,
      timeoutSeconds: config.translation.deepSeekRequestTimeoutSeconds,
    });
  }
  throw unsupportedTransport(transport);
}

module.exports = { createDeepSeekGateway };
