CREATE TABLE issues (
  id TEXT PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  backlog_issue_key TEXT,
  jira_issue_key TEXT,
  source_system TEXT NOT NULL CHECK(source_system IN ('backlog', 'jira', 'manual')),
  status TEXT NOT NULL DEFAULT 'ingested' CHECK(status IN (
    'ingested',
    'pending_translate',
    'pending_review',
    'approved',
    'syncing',
    'synced',
    'update_pending',
    'conflict',
    'archived'
  )),
  current_revision INTEGER NOT NULL DEFAULT 0,
  fields_json TEXT NOT NULL DEFAULT '{}',
  backlog_hash TEXT,
  jira_hash TEXT,
  backlog_updated_at TEXT,
  jira_updated_at TEXT,
  last_synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, backlog_issue_key),
  UNIQUE(project_id, jira_issue_key)
);

CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_backlog_key ON issues(project_id, backlog_issue_key);
CREATE INDEX idx_issues_jira_key ON issues(project_id, jira_issue_key);

CREATE TABLE issue_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  source_system TEXT NOT NULL CHECK(source_system IN ('backlog', 'jira', 'manual', 'ai')),
  source_event_id TEXT,
  summary TEXT NOT NULL,
  description TEXT,
  issue_type TEXT,
  priority TEXT,
  assignee TEXT,
  attachments_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(issue_id, revision)
);

CREATE INDEX idx_issue_revisions_issue ON issue_revisions(issue_id, revision);

CREATE TABLE issue_comments (
  id TEXT PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  backlog_comment_id TEXT,
  jira_comment_id TEXT,
  source_system TEXT NOT NULL CHECK(source_system IN ('backlog', 'jira', 'manual')),
  content_original TEXT NOT NULL,
  content_translated TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending', 'synced', 'skipped', 'failed')),
  author_name TEXT,
  created_at_source TEXT,
  created_at_cis TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(issue_id, backlog_comment_id),
  UNIQUE(issue_id, jira_comment_id)
);

CREATE INDEX idx_issue_comments_issue ON issue_comments(issue_id);
CREATE INDEX idx_issue_comments_sync_status ON issue_comments(sync_status);

CREATE TABLE issue_attachments (
  id TEXT PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  comment_id TEXT REFERENCES issue_comments(id) ON DELETE SET NULL,
  source_system TEXT NOT NULL CHECK(source_system IN ('backlog', 'jira', 'manual')),
  backlog_attachment_id TEXT,
  jira_attachment_id TEXT,
  original_filename TEXT NOT NULL,
  stored_path TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  sha256 TEXT,
  download_status TEXT NOT NULL DEFAULT 'pending' CHECK(download_status IN ('pending', 'downloaded', 'failed', 'skipped')),
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending', 'synced', 'skipped', 'failed')),
  error_message TEXT,
  created_at_source TEXT,
  created_at_cis TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(issue_id, source_system, backlog_attachment_id),
  UNIQUE(issue_id, source_system, jira_attachment_id)
);

CREATE INDEX idx_issue_attachments_issue ON issue_attachments(issue_id);
CREATE INDEX idx_issue_attachments_status ON issue_attachments(download_status, sync_status);
CREATE INDEX idx_issue_attachments_hash ON issue_attachments(issue_id, sha256);

CREATE TABLE translation_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  comment_id TEXT REFERENCES issue_comments(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK(target_type IN ('issue', 'comment')),
  source_language TEXT NOT NULL DEFAULT 'ja',
  target_language TEXT NOT NULL DEFAULT 'vi',
  source_text TEXT NOT NULL,
  ai_draft TEXT,
  reviewed_text TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK(review_status IN ('pending', 'ai_draft', 'approved', 'rejected', 'edited')),
  provider TEXT NOT NULL DEFAULT 'codex_exec',
  model_or_command TEXT,
  provider_request_id TEXT,
  confidence REAL,
  provider_error TEXT,
  review_notes TEXT,
  reviewed_at TEXT,
  reviewed_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_translation_queue_status ON translation_queue(review_status);
CREATE INDEX idx_translation_queue_project ON translation_queue(project_id, review_status, created_at);
CREATE INDEX idx_translation_queue_issue ON translation_queue(issue_id);

CREATE TABLE mapping_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mapping_type TEXT NOT NULL CHECK(mapping_type IN ('issue_type', 'status', 'priority', 'user', 'component')),
  direction_from TEXT NOT NULL CHECK(direction_from IN ('backlog', 'jira', 'cis', 'manual')),
  direction_to TEXT NOT NULL CHECK(direction_to IN ('backlog', 'jira', 'cis', 'manual')),
  from_value TEXT NOT NULL,
  to_value TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK(source_type IN ('manual', 'config_initial', 'ai_auto', 'ai_learned', 'auto_synced')),
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
  approved_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  approved_at TEXT,
  rejected_reason TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TEXT,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, mapping_type, direction_from, direction_to, from_value)
);

CREATE INDEX idx_mapping_rules_project ON mapping_rules(project_id, mapping_type);
CREATE INDEX idx_mapping_rules_approval ON mapping_rules(project_id, approval_status);
CREATE INDEX idx_mapping_rules_from ON mapping_rules(direction_from, from_value);
CREATE INDEX idx_mapping_rules_to ON mapping_rules(direction_to, to_value);

CREATE TABLE anomaly_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL CHECK(anomaly_type IN (
    'routing_mismatch',
    'mapping_gap',
    'translation_low_conf',
    'unusual_field_change',
    'sync_failure_chain'
  )),
  severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'resolved', 'ignored')),
  details_json TEXT NOT NULL DEFAULT '{}',
  ai_analysis TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolved_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_anomaly_log_status ON anomaly_log(status);
CREATE INDEX idx_anomaly_log_project ON anomaly_log(project_id);
CREATE INDEX idx_anomaly_log_issue ON anomaly_log(issue_id);

CREATE TABLE sync_jobs (
  id TEXT PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id TEXT REFERENCES issues(id) ON DELETE SET NULL,
  comment_id TEXT REFERENCES issue_comments(id) ON DELETE SET NULL,
  attachment_id TEXT REFERENCES issue_attachments(id) ON DELETE SET NULL,
  direction_from TEXT NOT NULL CHECK(direction_from IN ('backlog', 'jira', 'cis')),
  direction_to TEXT NOT NULL CHECK(direction_to IN ('backlog', 'jira', 'cis')),
  job_type TEXT NOT NULL CHECK(job_type IN (
    'webhook_ingest',
    'manual_pull',
    'dry_run',
    'translate',
    'push_issue',
    'push_comment',
    'push_attachment',
    'retry',
    'noop_test'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
  payload_json TEXT NOT NULL DEFAULT '{}',
  dedupe_key TEXT,
  priority INTEGER NOT NULL DEFAULT 100,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  run_after TEXT NOT NULL DEFAULT (datetime('now')),
  locked_at TEXT,
  locked_by TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_sync_jobs_dedupe ON sync_jobs(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX idx_sync_jobs_pending ON sync_jobs(status, run_after, priority, created_at);
CREATE INDEX idx_sync_jobs_issue ON sync_jobs(issue_id);
CREATE INDEX idx_sync_jobs_direction ON sync_jobs(direction_from, direction_to, status);

CREATE TABLE sync_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_job_id TEXT REFERENCES sync_jobs(id) ON DELETE SET NULL,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id TEXT REFERENCES issues(id) ON DELETE SET NULL,
  comment_id TEXT REFERENCES issue_comments(id) ON DELETE SET NULL,
  attachment_id TEXT REFERENCES issue_attachments(id) ON DELETE SET NULL,
  direction_from TEXT NOT NULL CHECK(direction_from IN ('backlog', 'jira', 'cis')),
  direction_to TEXT NOT NULL CHECK(direction_to IN ('backlog', 'jira', 'cis')),
  job_type TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending', 'running', 'cancelled')),
  trigger TEXT NOT NULL DEFAULT 'auto' CHECK(trigger IN ('webhook', 'manual', 'scheduled', 'ai', 'auto', 'system')),
  message TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  executed_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sync_journal_job ON sync_journal(sync_job_id);
CREATE INDEX idx_sync_journal_project ON sync_journal(project_id);
CREATE INDEX idx_sync_journal_issue ON sync_journal(issue_id);
CREATE INDEX idx_sync_journal_created ON sync_journal(created_at);
CREATE INDEX idx_sync_journal_direction ON sync_journal(direction_from, direction_to, status);

CREATE TABLE pull_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_system TEXT NOT NULL CHECK(source_system IN ('backlog', 'jira')),
  last_successful_pull_at TEXT,
  last_attempted_pull_at TEXT,
  cursor_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, source_system)
);

CREATE TABLE webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  source_system TEXT NOT NULL CHECK(source_system IN ('backlog', 'jira')),
  event_type TEXT NOT NULL,
  event_id TEXT,
  dedupe_key TEXT,
  payload_hash TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK(status IN (
    'received',
    'queued',
    'processed',
    'duplicate',
    'rejected',
    'unmatched_project',
    'failed'
  )),
  raw_payload TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0,
  processing_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_webhook_events_dedupe ON webhook_events(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX idx_webhook_events_project ON webhook_events(project_id, created_at);
CREATE INDEX idx_webhook_events_status ON webhook_events(status, created_at);
