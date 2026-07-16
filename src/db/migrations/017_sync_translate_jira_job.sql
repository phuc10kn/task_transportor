PRAGMA defer_foreign_keys = ON;

CREATE TABLE sync_jobs_next (
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
    'sync_translate_jira',
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

CREATE TABLE sync_journal_backup AS SELECT * FROM sync_journal;
DROP TABLE sync_journal;
INSERT INTO sync_jobs_next SELECT * FROM sync_jobs;
DROP TABLE sync_jobs;
ALTER TABLE sync_jobs_next RENAME TO sync_jobs;

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

INSERT INTO sync_journal SELECT * FROM sync_journal_backup;
DROP TABLE sync_journal_backup;

CREATE INDEX idx_sync_journal_job ON sync_journal(sync_job_id);
CREATE INDEX idx_sync_journal_project ON sync_journal(project_id);
CREATE INDEX idx_sync_journal_issue ON sync_journal(issue_id);
CREATE INDEX idx_sync_journal_created ON sync_journal(created_at);
CREATE INDEX idx_sync_journal_direction ON sync_journal(direction_from, direction_to, status);
