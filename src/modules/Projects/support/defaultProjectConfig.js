const DEFAULT_PULL_FILTER = {
  statuses: [],
  issue_types: [],
  priorities: [],
  include_closed: true,
  include_attachments: "metadata_only",
  page_size: 100,
};

const PROJECT_DEFAULTS = {
  enabled: true,
  sync_enabled: false,
  translation_provider: "codex_exec",
  source_language: "ja",
  target_language: "vi",
  translation_glossary_json: [],
  auto_translate: false,
  require_translation_review: false,
  require_mapping_approval: true,
  mapping_scope: "global_with_project_override",
  cis_mapping_values_json: {},
  backlog_mapping_values_json: {},
  jira_mapping_values_json: {},
  manual_pull_enabled: true,
  scheduled_pull_enabled: false,
  scheduled_pull_interval_minutes: 15,
  pull_updated_since_window_minutes: 30,
  scheduled_pull_filter_json: DEFAULT_PULL_FILTER,
};

module.exports = {
  DEFAULT_PULL_FILTER,
  PROJECT_DEFAULTS,
};
