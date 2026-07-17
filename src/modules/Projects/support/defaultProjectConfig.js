const {
  DEFAULT_TRANSLATION_AI_PROVIDER,
  DEFAULT_TRANSLATION_AI_MODEL,
  DEFAULT_TRANSLATION_AI_TRANSPORT,
} = require("../../../shared/translationModels");
const { DEFAULT_PULL_FILTER } = require("../../../shared/pullDefaults");

const PROJECT_DEFAULTS = {
  enabled: true,
  sync_enabled: false,
  translation_ai_provider: DEFAULT_TRANSLATION_AI_PROVIDER,
  translation_ai_transport: DEFAULT_TRANSLATION_AI_TRANSPORT,
  translation_ai_model: DEFAULT_TRANSLATION_AI_MODEL,
  translation_provider: DEFAULT_TRANSLATION_AI_PROVIDER,
  translation_model: DEFAULT_TRANSLATION_AI_MODEL,
  source_language: "ja",
  target_language: "vi",
  auto_translate: false,
  require_translation_review: false,
  require_mapping_approval: true,
  mapping_scope: "global_with_project_override",
  cis_mapping_values_json: {},
  backlog_mapping_values_json: {},
  jira_mapping_values_json: {},
  manual_pull_enabled: true,
  scheduled_pull_enabled: false,
  backlog_external_read_enabled: true,
  jira_external_read_enabled: true,
  jira_external_write_enabled: false,
  scheduled_pull_interval_minutes: 15,
  pull_updated_since_window_minutes: 30,
  scheduled_pull_filter_json: DEFAULT_PULL_FILTER,
};

module.exports = {
  DEFAULT_PULL_FILTER,
  PROJECT_DEFAULTS,
};
