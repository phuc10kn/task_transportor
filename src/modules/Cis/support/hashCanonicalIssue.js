const crypto = require("crypto");

const HASH_FIELDS = Object.freeze([
  "summary",
  "description",
  "issue_type",
  "priority",
  "status",
  "assignee",
  "due_date",
  "story_point",
]);

function hashCanonicalIssue({ canonical, issue }) {
  const payload = {
    issue_id: issue && issue.id,
    backlog_issue_key: issue && issue.backlog_issue_key || null,
    jira_issue_key: issue && issue.jira_issue_key || null,
    fields: {},
  };

  for (const field of HASH_FIELDS) {
    payload.fields[field] = canonical && canonical[field]
      ? canonical[field].value
      : null;
  }

  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`;
}

module.exports = {
  HASH_FIELDS,
  hashCanonicalIssue,
};
