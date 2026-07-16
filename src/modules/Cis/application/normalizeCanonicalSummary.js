function sourceIssueKey(issue = {}) {
  const source = String(issue.source_system || "").toLowerCase();
  if (source === "backlog") return issue.backlog_issue_key || null;
  if (source === "jira") return issue.jira_issue_key || null;
  return null;
}

function normalizeCanonicalSummary({ issue, summary }) {
  const text = String(summary || "");
  const key = String(sourceIssueKey(issue) || "").trim();
  if (!key) return text;
  const marker = `【${key}】`;
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `${marker}${text.replace(new RegExp(escaped, "gi"), "").trimStart()}`;
}

module.exports = { normalizeCanonicalSummary };
