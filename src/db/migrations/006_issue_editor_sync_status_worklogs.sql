DROP INDEX IF EXISTS idx_issues_status;

ALTER TABLE issues RENAME COLUMN status TO sync_status;

CREATE INDEX idx_issues_sync_status ON issues(sync_status);

CREATE TABLE issue_worklogs (
  id TEXT PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  source_system TEXT NOT NULL CHECK(source_system IN ('backlog', 'jira', 'manual')),
  source_worklog_id TEXT,
  author TEXT,
  started_at TEXT,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  comment TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending', 'synced', 'skipped', 'failed')),
  created_at_cis TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(issue_id, source_system, source_worklog_id)
);

CREATE INDEX idx_issue_worklogs_issue ON issue_worklogs(issue_id);
CREATE INDEX idx_issue_worklogs_sync_status ON issue_worklogs(sync_status);
