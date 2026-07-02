const { AppError } = require("../../../http/errors/AppError");
const { DEFAULT_PULL_FILTER, PROJECT_DEFAULTS } = require("./defaultProjectConfig");

const ALLOWED_FIELDS = [
  "name",
  "enabled",
  "sync_enabled",
  "backlog_space_url",
  "backlog_space_key",
  "backlog_project_key",
  "backlog_issue_key_prefix",
  "backlog_api_key_env",
  "backlog_webhook_secret_env",
  "jira_site_url",
  "jira_project_key",
  "jira_email_env",
  "jira_api_token_env",
  "jira_webhook_secret_env",
  "translation_provider",
  "translation_model",
  "translation_command_profile",
  "source_language",
  "target_language",
  "translation_glossary_json",
  "auto_translate",
  "require_translation_review",
  "require_mapping_approval",
  "mapping_scope",
  "cis_mapping_values_json",
  "backlog_mapping_values_json",
  "jira_mapping_values_json",
  "manual_pull_enabled",
  "scheduled_pull_enabled",
  "scheduled_pull_interval_minutes",
  "pull_updated_since_window_minutes",
  "scheduled_pull_filter_json",
];

const FORBIDDEN_SECRET_FIELDS = [
  "backlog_api_key",
  "jira_email",
  "jira_api_token",
  "jira_password",
  "jwt_secret",
  "webhook_secret",
];

const ENV_FIELDS = [
  "backlog_api_key_env",
  "backlog_webhook_secret_env",
  "jira_email_env",
  "jira_api_token_env",
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

function normalizeTranslationGlossary(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "translation_glossary_json must be an array.",
      status: 422,
    });
  }

  return value.map((entry, index) => {
    if (!isPlainObject(entry)) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Each translation glossary entry must be an object.",
        status: 422,
        details: { index },
      });
    }

    const source = String(entry.source || "").trim();
    const target = String(entry.target || "").trim();
    const notes = entry.notes === undefined || entry.notes === null
      ? undefined
      : String(entry.notes).trim();

    if (!source || !target) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Each translation glossary entry must include source and target.",
        status: 422,
        details: { index },
      });
    }

    return {
      source,
      target,
      ...(notes ? { notes } : {}),
    };
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

function normalizeProjectInput(input, { partial = false } = {}) {
  if (!isPlainObject(input)) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Project payload must be an object.",
      status: 422,
    });
  }

  assertNoSecretFields(input);
  assertEnvNames(input);

  const allowed = pickAllowed(input);
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

  for (const field of [
    "enabled",
    "sync_enabled",
    "auto_translate",
    "require_translation_review",
    "require_mapping_approval",
    "manual_pull_enabled",
    "scheduled_pull_enabled",
  ]) {
    if (Object.prototype.hasOwnProperty.call(merged, field)) {
      normalized[field] = toBoolean(merged[field], PROJECT_DEFAULTS[field]);
    }
  }

  for (const field of ["scheduled_pull_interval_minutes", "pull_updated_since_window_minutes"]) {
    if (Object.prototype.hasOwnProperty.call(merged, field)) {
      normalized[field] = toPositiveInteger(merged[field], PROJECT_DEFAULTS[field], field);
    }
  }

  if (Object.prototype.hasOwnProperty.call(merged, "scheduled_pull_filter_json")) {
    normalized.scheduled_pull_filter_json = normalizePullFilter(merged.scheduled_pull_filter_json);
  }

  if (Object.prototype.hasOwnProperty.call(merged, "translation_glossary_json")) {
    normalized.translation_glossary_json = normalizeTranslationGlossary(merged.translation_glossary_json);
  }

  for (const field of ["cis_mapping_values_json", "backlog_mapping_values_json", "jira_mapping_values_json"]) {
    if (Object.prototype.hasOwnProperty.call(merged, field)) {
      normalized[field] = normalizeMappingValues(merged[field], field);
    }
  }

  if (Object.prototype.hasOwnProperty.call(merged, "translation_provider")) {
    normalized.translation_provider = normalized.translation_provider || PROJECT_DEFAULTS.translation_provider;
  }

  return normalized;
}

module.exports = {
  normalizeProjectInput,
};
