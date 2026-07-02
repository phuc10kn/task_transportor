UPDATE issues
SET fields_json = json_set(fields_json, '$.summary.cis', json_extract(fields_json, '$.summary.backlog'))
WHERE (json_type(fields_json, '$.summary.cis') IS NULL OR json_type(fields_json, '$.summary.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.summary.cis'), '') = '')
  AND json_type(fields_json, '$.summary.backlog') IS NOT NULL
  AND json_type(fields_json, '$.summary.backlog') != 'null'
  AND COALESCE(json_extract(fields_json, '$.summary.backlog'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.description.cis', json_extract(fields_json, '$.description.backlog'))
WHERE (json_type(fields_json, '$.description.cis') IS NULL OR json_type(fields_json, '$.description.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.description.cis'), '') = '')
  AND json_type(fields_json, '$.description.backlog') IS NOT NULL
  AND json_type(fields_json, '$.description.backlog') != 'null'
  AND COALESCE(json_extract(fields_json, '$.description.backlog'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.issue_type.cis', json_extract(fields_json, '$.issue_type.backlog'))
WHERE (json_type(fields_json, '$.issue_type.cis') IS NULL OR json_type(fields_json, '$.issue_type.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.issue_type.cis'), '') = '')
  AND json_type(fields_json, '$.issue_type.backlog') IS NOT NULL
  AND json_type(fields_json, '$.issue_type.backlog') != 'null'
  AND COALESCE(json_extract(fields_json, '$.issue_type.backlog'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.status.cis', json_extract(fields_json, '$.status.backlog'))
WHERE (json_type(fields_json, '$.status.cis') IS NULL OR json_type(fields_json, '$.status.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.status.cis'), '') = '')
  AND json_type(fields_json, '$.status.backlog') IS NOT NULL
  AND json_type(fields_json, '$.status.backlog') != 'null'
  AND COALESCE(json_extract(fields_json, '$.status.backlog'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.priority.cis', json_extract(fields_json, '$.priority.backlog'))
WHERE (json_type(fields_json, '$.priority.cis') IS NULL OR json_type(fields_json, '$.priority.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.priority.cis'), '') = '')
  AND json_type(fields_json, '$.priority.backlog') IS NOT NULL
  AND json_type(fields_json, '$.priority.backlog') != 'null'
  AND COALESCE(json_extract(fields_json, '$.priority.backlog'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.assignee.cis', json_extract(fields_json, '$.assignee.backlog'))
WHERE (json_type(fields_json, '$.assignee.cis') IS NULL OR json_type(fields_json, '$.assignee.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.assignee.cis'), '') = '')
  AND json_type(fields_json, '$.assignee.backlog') IS NOT NULL
  AND json_type(fields_json, '$.assignee.backlog') != 'null'
  AND COALESCE(json_extract(fields_json, '$.assignee.backlog'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.due_date.cis', json_extract(fields_json, '$.due_date.backlog'))
WHERE (json_type(fields_json, '$.due_date.cis') IS NULL OR json_type(fields_json, '$.due_date.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.due_date.cis'), '') = '')
  AND json_type(fields_json, '$.due_date.backlog') IS NOT NULL
  AND json_type(fields_json, '$.due_date.backlog') != 'null'
  AND COALESCE(json_extract(fields_json, '$.due_date.backlog'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.summary.cis', json_extract(fields_json, '$.summary.jira'))
WHERE (json_type(fields_json, '$.summary.cis') IS NULL OR json_type(fields_json, '$.summary.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.summary.cis'), '') = '')
  AND json_type(fields_json, '$.summary.jira') IS NOT NULL
  AND json_type(fields_json, '$.summary.jira') != 'null'
  AND COALESCE(json_extract(fields_json, '$.summary.jira'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.description.cis', json_extract(fields_json, '$.description.jira'))
WHERE (json_type(fields_json, '$.description.cis') IS NULL OR json_type(fields_json, '$.description.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.description.cis'), '') = '')
  AND json_type(fields_json, '$.description.jira') IS NOT NULL
  AND json_type(fields_json, '$.description.jira') != 'null'
  AND COALESCE(json_extract(fields_json, '$.description.jira'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.issue_type.cis', json_extract(fields_json, '$.issue_type.jira'))
WHERE (json_type(fields_json, '$.issue_type.cis') IS NULL OR json_type(fields_json, '$.issue_type.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.issue_type.cis'), '') = '')
  AND json_type(fields_json, '$.issue_type.jira') IS NOT NULL
  AND json_type(fields_json, '$.issue_type.jira') != 'null'
  AND COALESCE(json_extract(fields_json, '$.issue_type.jira'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.status.cis', json_extract(fields_json, '$.status.jira'))
WHERE (json_type(fields_json, '$.status.cis') IS NULL OR json_type(fields_json, '$.status.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.status.cis'), '') = '')
  AND json_type(fields_json, '$.status.jira') IS NOT NULL
  AND json_type(fields_json, '$.status.jira') != 'null'
  AND COALESCE(json_extract(fields_json, '$.status.jira'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.priority.cis', json_extract(fields_json, '$.priority.jira'))
WHERE (json_type(fields_json, '$.priority.cis') IS NULL OR json_type(fields_json, '$.priority.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.priority.cis'), '') = '')
  AND json_type(fields_json, '$.priority.jira') IS NOT NULL
  AND json_type(fields_json, '$.priority.jira') != 'null'
  AND COALESCE(json_extract(fields_json, '$.priority.jira'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.assignee.cis', json_extract(fields_json, '$.assignee.jira'))
WHERE (json_type(fields_json, '$.assignee.cis') IS NULL OR json_type(fields_json, '$.assignee.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.assignee.cis'), '') = '')
  AND json_type(fields_json, '$.assignee.jira') IS NOT NULL
  AND json_type(fields_json, '$.assignee.jira') != 'null'
  AND COALESCE(json_extract(fields_json, '$.assignee.jira'), '') != '';

UPDATE issues
SET fields_json = json_set(fields_json, '$.due_date.cis', json_extract(fields_json, '$.due_date.jira'))
WHERE (json_type(fields_json, '$.due_date.cis') IS NULL OR json_type(fields_json, '$.due_date.cis') = 'null' OR COALESCE(json_extract(fields_json, '$.due_date.cis'), '') = '')
  AND json_type(fields_json, '$.due_date.jira') IS NOT NULL
  AND json_type(fields_json, '$.due_date.jira') != 'null'
  AND COALESCE(json_extract(fields_json, '$.due_date.jira'), '') != '';
