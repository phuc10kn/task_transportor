const { AppError } = require("../../../http/errors/AppError");
const { createAnthropicCompatibleMessagesClient } = require("../../../infrastructure/ai/AnthropicCompatibleMessagesClient");
const { createCodexExecClient } = require("../../../infrastructure/ai/CodexExecClient");
const { createOpenAiCompatibleChatClient } = require("../../../infrastructure/ai/OpenAiCompatibleChatClient");
const {
  DEFAULT_TRANSLATION_AI_MODEL,
  DEFAULT_TRANSLATION_AI_TRANSPORT,
  TRANSLATION_AI_PROVIDERS,
  TRANSLATION_AI_TRANSPORTS,
  normalizeTranslationAiModel,
  normalizeTranslationAiProvider,
  normalizeTranslationAiTransport,
} = require("../../../shared/translationModels");
const { createProcessTranslationAdapter } = require("../infrastructure/ProcessTranslationAdapter");
const { createTranslationAdapter } = require("../infrastructure/TranslationAdapter");

function createConfiguredChatClient({ config, transport }) {
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

  const error = new AppError({
    code: "TRANSLATION_AI_TRANSPORT_UNSUPPORTED",
    message: "Translation AI transport is not supported for DeepSeek.",
    status: 422,
    details: { transport },
  });
  error.retryable = false;
  throw error;
}

function translationAdapterFor({ config, aiProvider, aiTransport, modelOrCommand }) {
  const source = normalizeTranslationAiProvider(aiProvider);
  const transport = normalizeTranslationAiTransport(aiTransport || DEFAULT_TRANSLATION_AI_TRANSPORT);

  if (source === TRANSLATION_AI_PROVIDERS.CODEX_EXEC) {
    const command = config.translation.codexExecCommand;
    return createProcessTranslationAdapter({
      command,
      processClient: createCodexExecClient({
        command,
        timeoutSeconds: config.translation.codexExecTimeoutSeconds,
        workdir: config.translation.codexExecWorkdir,
      }),
    });
  }

  if (source === TRANSLATION_AI_PROVIDERS.DEEPSEEK) {
    const model = normalizeTranslationAiModel(source, modelOrCommand || DEFAULT_TRANSLATION_AI_MODEL);
    return createTranslationAdapter({
      aiClient: createConfiguredChatClient({ config, transport }),
      aiSource: source,
      model,
    });
  }

  const error = new AppError({
    code: "TRANSLATION_AI_PROVIDER_UNSUPPORTED",
    message: "Translation AI provider is not supported.",
    status: 422,
    details: { ai_provider: source },
  });
  error.retryable = false;
  throw error;
}

module.exports = {
  translationAdapterFor,
};
