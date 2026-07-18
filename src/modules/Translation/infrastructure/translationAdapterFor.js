const { AppError } = require("../../../http/errors/AppError");
const { createDeepSeekGateway } = require("../../../infrastructure/external/providers/deepseek/DeepSeekGateway");
const { createOpenAiGateway } = require("../../../infrastructure/external/providers/openai/OpenAiGateway");
const {
  DEFAULT_TRANSLATION_AI_MODEL,
  DEFAULT_TRANSLATION_AI_TRANSPORT,
  TRANSLATION_AI_PROVIDERS,
  defaultTranslationAiModelFor,
  normalizeTranslationAiModel,
  normalizeTranslationAiProvider,
  normalizeTranslationAiTransport,
} = require("../../../shared/translationModels");
const { createTranslationAdapter } = require("./TranslationAdapter");

function createConfiguredChatClient({ config, source, transport }) {
  if (source === TRANSLATION_AI_PROVIDERS.OPENAI) {
    return createOpenAiGateway({ config, transport });
  }

  return createDeepSeekGateway({ config, transport });
}

function createConfiguredTranslationAdapter({ config, aiProvider, aiTransport, modelOrCommand }) {
  const source = normalizeTranslationAiProvider(aiProvider);
  const transport = normalizeTranslationAiTransport(aiTransport || DEFAULT_TRANSLATION_AI_TRANSPORT);

  if ([TRANSLATION_AI_PROVIDERS.DEEPSEEK, TRANSLATION_AI_PROVIDERS.OPENAI].includes(source)) {
    const model = normalizeTranslationAiModel(
      source,
      modelOrCommand || defaultTranslationAiModelFor(source) || DEFAULT_TRANSLATION_AI_MODEL
    );
    return createTranslationAdapter({
      aiClient: createConfiguredChatClient({ config, source, transport }),
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
  createConfiguredTranslationAdapter,
};
