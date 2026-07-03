const TRANSLATION_AI_PROVIDERS = {
  DEEPSEEK: "deepseek",
  CODEX_EXEC: "codex_exec",
};

const TRANSLATION_AI_TRANSPORTS = {
  OPENAI_COMPATIBLE: "openai_compatible",
  ANTHROPIC_COMPATIBLE: "anthropic_compatible",
  PROCESS_EXEC: "process_exec",
};

const DEFAULT_TRANSLATION_AI_PROVIDER = TRANSLATION_AI_PROVIDERS.DEEPSEEK;
const DEFAULT_TRANSLATION_AI_TRANSPORT = TRANSLATION_AI_TRANSPORTS.OPENAI_COMPATIBLE;
const DEFAULT_TRANSLATION_AI_MODEL = "deepseek-v4-flash";
const TRANSLATION_AI_MODEL_WARNINGS = {
  "deepseek-chat": "Deprecated soon: deepseek-chat is scheduled to retire on 2026-07-24 15:59 UTC.",
};

const TRANSLATION_AI_MODEL_OPTIONS = {
  [TRANSLATION_AI_PROVIDERS.DEEPSEEK]: [
    { value: "deepseek-v4-flash", label: "deepseek-v4-flash", api_model: "deepseek-v4-flash" },
    { value: "deepseek-v4-pro", label: "deepseek-v4-pro", api_model: "deepseek-v4-pro" },
    {
      value: "deepseek-chat",
      label: "deepseek-chat",
      api_model: "deepseek-chat",
      warning: TRANSLATION_AI_MODEL_WARNINGS["deepseek-chat"],
    },
  ],
};

const TRANSLATION_AI_MODEL_ALIASES = {
  [TRANSLATION_AI_PROVIDERS.DEEPSEEK]: {
    deepseekchat: "deepseek-chat",
    deepseekv4pro: "deepseek-v4-pro",
    deepseekv4: "deepseek-v4-flash",
    deepseekv4flash: "deepseek-v4-flash",
  },
};

const TRANSLATION_AI_PROVIDER_TRANSPORTS = {
  [TRANSLATION_AI_PROVIDERS.DEEPSEEK]: [
    TRANSLATION_AI_TRANSPORTS.OPENAI_COMPATIBLE,
    TRANSLATION_AI_TRANSPORTS.ANTHROPIC_COMPATIBLE,
  ],
  [TRANSLATION_AI_PROVIDERS.CODEX_EXEC]: [
    TRANSLATION_AI_TRANSPORTS.PROCESS_EXEC,
  ],
};

function compact(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeTranslationAiProvider(value) {
  const provider = String(value || DEFAULT_TRANSLATION_AI_PROVIDER).trim();
  const allowed = Object.values(TRANSLATION_AI_PROVIDERS);
  return allowed.includes(provider) ? provider : provider;
}

function normalizeTranslationAiTransport(value) {
  const transport = String(value || DEFAULT_TRANSLATION_AI_TRANSPORT).trim();
  const allowed = Object.values(TRANSLATION_AI_TRANSPORTS);
  return allowed.includes(transport) ? transport : transport;
}

function normalizeProviderModel(provider, value) {
  const normalizedProvider = normalizeTranslationAiProvider(provider);
  const raw = String(value || DEFAULT_TRANSLATION_AI_MODEL).trim();
  const compactValue = compact(raw);
  const aliases = TRANSLATION_AI_MODEL_ALIASES[normalizedProvider] || {};
  if (aliases[compactValue]) {
    return aliases[compactValue];
  }

  const options = TRANSLATION_AI_MODEL_OPTIONS[normalizedProvider] || [];
  const found = options.find((model) => {
    const aliases = [model.value, model.label, model.api_model];
    return aliases.some((alias) => compact(alias) === compactValue);
  });

  return found ? found.value : raw;
}

function translationAiTransportsForProvider(provider) {
  const normalized = normalizeTranslationAiProvider(provider);
  return TRANSLATION_AI_PROVIDER_TRANSPORTS[normalized] || [];
}

function isTranslationAiTransportAllowed(provider, transport) {
  const normalizedTransport = normalizeTranslationAiTransport(transport);
  return translationAiTransportsForProvider(provider).includes(normalizedTransport);
}

function normalizeTranslationAiModel(provider, value) {
  const normalizedProvider = normalizeTranslationAiProvider(provider);
  if (TRANSLATION_AI_MODEL_OPTIONS[normalizedProvider]) {
    return normalizeProviderModel(normalizedProvider, value);
  }

  return value === undefined || value === null || value === "" ? null : String(value).trim();
}

function translationAiModelsFor(provider, transport) {
  const normalizedProvider = normalizeTranslationAiProvider(provider);
  const normalizedTransport = normalizeTranslationAiTransport(transport);
  if (
    normalizedProvider === TRANSLATION_AI_PROVIDERS.DEEPSEEK &&
    isTranslationAiTransportAllowed(normalizedProvider, normalizedTransport)
  ) {
    return TRANSLATION_AI_MODEL_OPTIONS[normalizedProvider] || [];
  }

  return [];
}

function isTranslationAiModelAllowed(provider, transport, model) {
  const normalizedModel = normalizeTranslationAiModel(provider, model);
  return translationAiModelsFor(provider, transport)
    .some((option) => option.value === normalizedModel);
}

module.exports = {
  DEFAULT_TRANSLATION_AI_PROVIDER,
  DEFAULT_TRANSLATION_AI_TRANSPORT,
  DEFAULT_TRANSLATION_AI_MODEL,
  DEFAULT_TRANSLATION_PROVIDER: DEFAULT_TRANSLATION_AI_PROVIDER,
  TRANSLATION_AI_PROVIDERS,
  TRANSLATION_AI_MODEL_OPTIONS,
  TRANSLATION_AI_MODEL_WARNINGS,
  TRANSLATION_AI_TRANSPORTS,
  TRANSLATION_AI_PROVIDER_TRANSPORTS,
  TRANSLATION_PROVIDERS: TRANSLATION_AI_PROVIDERS,
  isTranslationAiModelAllowed,
  isTranslationAiTransportAllowed,
  normalizeProvider: normalizeTranslationAiProvider,
  normalizeTranslationAiProvider,
  normalizeTranslationAiModel,
  normalizeTranslationAiTransport,
  translationAiModelsFor,
  translationAiTransportsForProvider,
};
