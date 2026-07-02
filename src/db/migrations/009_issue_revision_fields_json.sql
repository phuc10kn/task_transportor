ALTER TABLE issue_revisions ADD COLUMN fields_json TEXT NOT NULL DEFAULT '{}';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.summary.backlog', summary)
WHERE source_system = 'backlog' AND summary IS NOT NULL AND summary != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.description.backlog', description)
WHERE source_system = 'backlog' AND description IS NOT NULL AND description != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.issue_type.backlog', issue_type)
WHERE source_system = 'backlog' AND issue_type IS NOT NULL AND issue_type != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.priority.backlog', priority)
WHERE source_system = 'backlog' AND priority IS NOT NULL AND priority != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.assignee.backlog', assignee)
WHERE source_system = 'backlog' AND assignee IS NOT NULL AND assignee != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.summary.jira', summary)
WHERE source_system = 'jira' AND summary IS NOT NULL AND summary != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.description.jira', description)
WHERE source_system = 'jira' AND description IS NOT NULL AND description != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.issue_type.jira', issue_type)
WHERE source_system = 'jira' AND issue_type IS NOT NULL AND issue_type != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.priority.jira', priority)
WHERE source_system = 'jira' AND priority IS NOT NULL AND priority != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.assignee.jira', assignee)
WHERE source_system = 'jira' AND assignee IS NOT NULL AND assignee != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.summary.cis', summary)
WHERE source_system IN ('manual', 'ai') AND summary IS NOT NULL AND summary != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.description.cis', description)
WHERE source_system IN ('manual', 'ai') AND description IS NOT NULL AND description != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.issue_type.cis', issue_type)
WHERE source_system IN ('manual', 'ai') AND issue_type IS NOT NULL AND issue_type != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.priority.cis', priority)
WHERE source_system IN ('manual', 'ai') AND priority IS NOT NULL AND priority != '';

UPDATE issue_revisions
SET fields_json = json_set(fields_json, '$.assignee.cis', assignee)
WHERE source_system IN ('manual', 'ai') AND assignee IS NOT NULL AND assignee != '';
