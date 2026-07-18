const { AppError } = require("../../../http/errors/AppError");
const {
  DEFAULT_TRANSLATION_AI_TRANSPORT,
  TRANSLATION_AI_PROVIDERS,
  TRANSLATION_AI_TRANSPORTS,
  defaultTranslationAiModelFor,
  isTranslationAiModelAllowed,
  isTranslationAiTransportAllowed,
  normalizeTranslationAiModel,
  normalizeTranslationAiProvider,
  normalizeTranslationAiTransport,
} = require("../../../shared/translationModels");
const { DEFAULT_PULL_FILTER, PROJECT_DEFAULTS } = require("./defaultProjectConfig");

const ALLOWED_FIELDS = [
  "name",
  "enabled",
  "sync_enabled",
  "backlog_space_url",
  "backlog_space_key",
  "backlog_project_key",
  "backlog_issue_key_prefix",
  "backlog_api_key",
  "backlog_api_key_env",
  "backlog_webhook_secret_env",
  "jira_site_url",
  "jira_project_key",
  "jira_email",
  "jira_email_env",
  "jira_api_token",
  "jira_api_token_env",
  "jira_webhook_secret_env",
  "translation_ai_provider",
  "translation_ai_transport",
  "translation_ai_model",
  "translation_provider",
  "translation_model",
  "translation_command_profile",
  "source_language",
  "target_language",
  "auto_translate",
  "require_translation_review",
  "require_mapping_approval",
  "mapping_scope",
  "cis_mapping_values_json",
  "backlog_mapping_values_json",
  "jira_mapping_values_json",
  "manual_pull_enabled",
  "scheduled_pull_enabled",
  "backlog_external_read_enabled",
  "jira_external_read_enabled",
  "jira_external_write_enabled",
  "scheduled_pull_interval_minutes",
  "pull_updated_since_window_minutes",
  "scheduled_pull_filter_json",
];

const FORBIDDEN_SECRET_FIELDS = [
  "jira_password",
  "jwt_secret",
  "webhook_secret",
];

const ENV_FIELDS = [
  "backlog_webhook_secret_env",
  "jira_webhook_secret_env",
];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  return Boolean(value);
}

function toPositiveInteger(value, fallback, field) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: `${field} must be a positive integer.`,
      status: 422,
    });
  }

  return parsed;
}

function normalizePullFilter(value) {
  if (value === undefined || value === null || value === "") {
    return { ...DEFAULT_PULL_FILTER };
  }

  if (!isPlainObject(value)) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "scheduled_pull_filter_json must be an object.",
      status: 422,
    });
  }

  return {
    ...DEFAULT_PULL_FILTER,
    ...value,
    statuses: Array.isArray(value.statuses) ? value.statuses : DEFAULT_PULL_FILTER.statuses,
    issue_types: Array.isArray(value.issue_types) ? value.issue_types : DEFAULT_PULL_FILTER.issue_types,
    priorities: Array.isArray(value.priorities) ? value.priorities : DEFAULT_PULL_FILTER.priorities,
    page_size: toPositiveInteger(value.page_size, DEFAULT_PULL_FILTER.page_size, "page_size"),
  };
}

function normalizeMappingDirectory(values, fieldName, mappingType) {
  if (!Array.isArray(values)) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: `${fieldName}.${mappingType} must be an array.`,
      status: 422,
      details: { field: fieldName, mapping_type: mappingType },
    });
  }

  const byId = new Map();
  for (const entry of values) {
    const rawId = entry && entry.id;
    const idText = rawId === undefined || rawId === null ? "" : String(rawId).trim();
    const numericId = Number(idText);
    const id = /^\d+$/.test(idText) && Number.isSafeInteger(numericId) && numericId > 0
      ? numericId
      : idText;
    const name = String(entry && entry.name || "").trim();
    const rawValue = entry && entry.value;
    const value = rawValue === undefined || rawValue === null ? name : String(rawValue).trim();
    if (!idText || !name || !value) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: `${fieldName}.${mappingType} entries require id, value and name.`,
        status: 422,
        details: { field: fieldName, mapping_type: mappingType },
      });
    }

    const displayOrder = Number(entry.display_order);
    byId.set(id, {
      id,
      value,
      name,
      ...(String(entry && entry.email || "").trim() ? { email: String(entry.email).trim() } : {}),
      ...(mappingType === "status_directory" && Number.isSafeInteger(displayOrder) && displayOrder >= 0
        ? { display_order: displayOrder }
        : {}),
    });
  }

  return [...byId.values()].sort((left, right) => {
    if (mappingType === "status_directory") {
      const order = (left.display_order ?? Number.MAX_SAFE_INTEGER) - (right.display_order ?? Number.MAX_SAFE_INTEGER);
      if (order) return order;
    }
    return left.name.localeCompare(right.name) || String(left.id).localeCompare(String(right.id));
  });
}

function normalizeMappingValues(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return {};
  }

  if (!isPlainObject(value)) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: `${fieldName} must be an object.`,
      status: 422,
    });
  }

  return Object.entries(value).reduce((normalized, [mappingType, values]) => {
    if (mappingType.endsWith("_directory")) {
      normalized[mappingType] = normalizeMappingDirectory(values, fieldName, mappingType);
      return normalized;
    }

    if (mappingType.endsWith("_labels")) {
      if (!isPlainObject(values)) {
        throw new AppError({
          code: "VALIDATION_ERROR",
          message: `${fieldName}.${mappingType} must be an object.`,
          status: 422,
          details: { field: fieldName, mapping_type: mappingType },
        });
      }

      normalized[mappingType] = Object.entries(values).reduce((labels, [key, label]) => {
        const normalizedKey = String(key || "").trim();
        const normalizedLabel = String(label === null || label === undefined ? "" : label).trim();
        if (normalizedKey && normalizedLabel) {
          labels[normalizedKey] = normalizedLabel;
        }
        return labels;
      }, {});
      return normalized;
    }

    if (!Array.isArray(values)) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: `${fieldName}.${mappingType} must be an array.`,
        status: 422,
        details: { field: fieldName, mapping_type: mappingType },
      });
    }

    normalized[mappingType] = Array.from(new Set(values
      .map((item) => String(item === null || item === undefined ? "" : item).trim())
      .filter(Boolean)));

    return normalized;
  }, {});
}

function assertNoSecretFields(input) {
  const present = FORBIDDEN_SECRET_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(input, field));

  if (present.length > 0) {
    throw new AppError({
      code: "SECRET_FIELD_NOT_ALLOWED",
      message: "Project config must store credential environment variable names, not secret values.",
      status: 422,
      details: { fields: present },
    });
  }
}

function assertEnvNames(input) {
  for (const field of ENV_FIELDS) {
    const value = input[field];
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (!/^[A-Z][A-Z0-9_]*$/.test(String(value))) {
      throw new AppError({
        code: "INVALID_ENV_NAME",
        message: `${field} must contain an environment variable name.`,
        status: 422,
        details: { field },
      });
    }
  }
}

function pickAllowed(input) {
  return ALLOWED_FIELDS.reduce((picked, field) => {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      picked[field] = input[field];
    }

    return picked;
  }, {});
}

function applyCredentialAliases(input) {
  const aliased = { ...input };
  const aliases = [
    ["backlog_api_key_env", "backlog_api_key"],
    ["jira_email_env", "jira_email"],
    ["jira_api_token_env", "jira_api_token"],
  ];

  for (const [legacyField, canonicalField] of aliases) {
    if (
      Object.prototype.hasOwnProperty.call(aliased, legacyField) &&
      !Object.prototype.hasOwnProperty.call(aliased, canonicalField)
    ) {
      aliased[canonicalField] = aliased[legacyField];
    }

    delete aliased[legacyField];
  }

  return aliased;
}

function normalizeProjectInput(input, { partial = false } = {}) {
  if (!isPlainObject(input)) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Project payload must be an object.",
      status: 422,
    });
  }

  const credentialAliasedInput = applyCredentialAliases(input);

  if (Object.prototype.hasOwnProperty.call(credentialAliasedInput, "translation_glossary_json")) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "translation_glossary_json is no longer accepted; use Translation Glossary.",
      status: 422,
      details: { field: "translation_glossary_json" },
    });
  }

  assertNoSecretFields(credentialAliasedInput);
  assertEnvNames(credentialAliasedInput);

  const allowed = pickAllowed(credentialAliasedInput);
  if (
    Object.prototype.hasOwnProperty.call(allowed, "translation_provider") &&
    !Object.prototype.hasOwnProperty.call(allowed, "translation_ai_provider")
  ) {
    allowed.translation_ai_provider = allowed.translation_provider;
  }
  if (
    Object.prototype.hasOwnProperty.call(allowed, "translation_model") &&
    !Object.prototype.hasOwnProperty.call(allowed, "translation_ai_model")
  ) {
    allowed.translation_ai_model = allowed.translation_model;
  }
  const merged = partial ? allowed : { ...PROJECT_DEFAULTS, ...allowed };

  if (!partial && !merged.name) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Project name is required.",
      status: 422,
    });
  }

  const normalized = { ...merged };

  if (Object.prototype.hasOwnProperty.call(merged, "name")) {
    normalized.name = String(merged.name).trim();
    if (!normalized.name) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Project name is required.",
        status: 422,
      });
    }
  }

  for (const field of ["source_language", "target_language"]) {
    if (Object.prototype.hasOwnProperty.call(merged, field)) {
      normalized[field] = String(merged[field] === null || merged[field] === undefined ? "" : merged[field])
        .trim()
        .toLowerCase();
      if (!normalized[field]) {
        throw new AppError({
          code: "VALIDATION_ERROR",
          message: `${field} is required.`,
          status: 422,
          details: { field },
        });
      }
    }
  }

  for (const field of [
    "enabled",
    "sync_enabled",
    "auto_translate",
    "require_translation_review",
    "require_mapping_approval",
    "manual_pull_enabled",
    "scheduled_pull_enabled",
    "backlog_external_read_enabled",
    "jira_external_read_enabled",
    "jira_external_write_enabled",
  ]) {
    if (Object.prototype.hasOwnProperty.call(merged, field)) {
      normalized[field] = toBoolean(merged[field], PROJECT_DEFAULTS[field]);
    }
  }

  for (const field of ["backlog_space_url", "jira_site_url"]) {
    if (!Object.prototype.hasOwnProperty.call(merged, field)) continue;
    const value = String(merged[field] || "").trim();
    normalized[field] = value;
    if (!value) continue;

    let url;
    try {
      url = new URL(value);
    } catch (_error) {
      url = null;
    }
    if (
      !url || url.protocol !== "https:" || !url.hostname || url.username || url.password
      || url.search || url.hash || (url.pathname && url.pathname !== "/")
    ) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: `${field} must be an HTTPS origin without credentials, path, query or fragment.`,
        status: 422,
        details: { field },
      });
    }
    normalized[field] = url.origin;
  }

  for (const field of ["scheduled_pull_interval_minutes", "pull_updated_since_window_minutes"]) {
    if (Object.prototype.hasOwnProperty.call(merged, field)) {
      normalized[field] = toPositiveInteger(merged[field], PROJECT_DEFAULTS[field], field);
    }
  }

  if (Object.prototype.hasOwnProperty.call(merged, "scheduled_pull_filter_json")) {
    normalized.scheduled_pull_filter_json = normalizePullFilter(merged.scheduled_pull_filter_json);
  }

  for (const field of ["cis_mapping_values_json", "backlog_mapping_values_json", "jira_mapping_values_json"]) {
    if (Object.prototype.hasOwnProperty.call(merged, field)) {
      normalized[field] = normalizeMappingValues(merged[field], field);
    }
  }

  if (Object.prototype.hasOwnProperty.call(merged, "translation_ai_provider")) {
    normalized.translation_ai_provider = normalizeTranslationAiProvider(normalized.translation_ai_provider);
    if (!Object.values(TRANSLATION_AI_PROVIDERS).includes(normalized.translation_ai_provider)) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "translation_ai_provider is not supported.",
        status: 422,
        details: { translation_ai_provider: normalized.translation_ai_provider },
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call(merged, "translation_ai_transport")) {
    normalized.translation_ai_transport = normalizeTranslationAiTransport(normalized.translation_ai_transport);
    if (!Object.values(TRANSLATION_AI_TRANSPORTS).includes(normalized.translation_ai_transport)) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "translation_ai_transport is not supported.",
        status: 422,
        details: { translation_ai_transport: normalized.translation_ai_transport },
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call(merged, "translation_ai_model")) {
    normalized.translation_ai_model = normalized.translation_ai_model
      ? normalizeTranslationAiModel(normalized.translation_ai_provider, normalized.translation_ai_model)
      : null;
  }

  const defaultAiModel = defaultTranslationAiModelFor(normalized.translation_ai_provider);
  if (defaultAiModel && !normalized.translation_ai_model) {
    normalized.translation_ai_model = defaultAiModel;
  }

  if (
    normalized.translation_ai_provider &&
    normalized.translation_ai_provider && !normalized.translation_ai_transport
  ) {
    normalized.translation_ai_transport = DEFAULT_TRANSLATION_AI_TRANSPORT;
  }

  if (
    normalized.translation_ai_provider &&
    normalized.translation_ai_transport &&
    !isTranslationAiTransportAllowed(normalized.translation_ai_provider, normalized.translation_ai_transport)
  ) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "translation_ai_transport is not allowed for translation_ai_provider.",
      status: 422,
      details: {
        translation_ai_provider: normalized.translation_ai_provider,
        translation_ai_transport: normalized.translation_ai_transport,
      },
    });
  }

  if (
    normalized.translation_ai_model &&
    !isTranslationAiModelAllowed(
      normalized.translation_ai_provider,
      normalized.translation_ai_transport || DEFAULT_TRANSLATION_AI_TRANSPORT,
      normalized.translation_ai_model
    )
  ) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "translation_ai_model is not allowed for translation_ai_provider and translation_ai_transport.",
      status: 422,
      details: {
        translation_ai_provider: normalized.translation_ai_provider,
        translation_ai_transport: normalized.translation_ai_transport,
        translation_ai_model: normalized.translation_ai_model,
      },
    });
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "translation_ai_provider")) {
    normalized.translation_provider = normalized.translation_ai_provider;
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "translation_ai_model")) {
    normalized.translation_model = normalized.translation_ai_model;
  }

  return normalized;
}

module.exports = {
  normalizeProjectInput,
};
