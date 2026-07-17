ALTER TABLE projects ADD COLUMN backlog_external_read_enabled INTEGER NOT NULL DEFAULT 1 CHECK(backlog_external_read_enabled IN (0, 1));
ALTER TABLE projects ADD COLUMN jira_external_read_enabled INTEGER NOT NULL DEFAULT 1 CHECK(jira_external_read_enabled IN (0, 1));
ALTER TABLE projects ADD COLUMN jira_external_write_enabled INTEGER NOT NULL DEFAULT 1 CHECK(jira_external_write_enabled IN (0, 1));
