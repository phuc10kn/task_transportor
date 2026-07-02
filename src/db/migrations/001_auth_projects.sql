CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sync_enabled INTEGER NOT NULL DEFAULT 0,

  backlog_space_url TEXT,
  backlog_space_key TEXT,
  backlog_project_key TEXT,
  backlog_issue_key_prefix TEXT,
  backlog_api_key_env TEXT,
  backlog_webhook_secret_env TEXT,

  jira_site_url TEXT,
  jira_project_key TEXT,
  jira_email_env TEXT,
  jira_api_token_env TEXT,
  jira_webhook_secret_env TEXT,

  translation_provider TEXT NOT NULL DEFAULT 'codex_exec',
  translation_model TEXT,
  translation_command_profile TEXT,
  source_language TEXT NOT NULL DEFAULT 'ja',
  target_language TEXT NOT NULL DEFAULT 'vi',
  auto_translate INTEGER NOT NULL DEFAULT 1,
  require_translation_review INTEGER NOT NULL DEFAULT 1,
  require_mapping_approval INTEGER NOT NULL DEFAULT 1,
  mapping_scope TEXT NOT NULL DEFAULT 'global_with_project_override',

  manual_pull_enabled INTEGER NOT NULL DEFAULT 1,
  scheduled_pull_enabled INTEGER NOT NULL DEFAULT 0,
  scheduled_pull_interval_minutes INTEGER NOT NULL DEFAULT 15,
  pull_updated_since_window_minutes INTEGER NOT NULL DEFAULT 30,
  scheduled_pull_filter_json TEXT NOT NULL,
  last_backlog_pull_at TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
