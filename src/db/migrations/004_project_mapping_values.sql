ALTER TABLE projects
ADD COLUMN backlog_mapping_values_json TEXT NOT NULL DEFAULT '{}';

ALTER TABLE projects
ADD COLUMN jira_mapping_values_json TEXT NOT NULL DEFAULT '{}';
