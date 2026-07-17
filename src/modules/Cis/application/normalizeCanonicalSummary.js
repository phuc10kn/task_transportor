function sourceIssueKey(issue = {}) {
  const source = String(issue.source_system || "").toLowerCase();
  if (source === "backlog") return issue.backlog_issue_key || null;
  if (source === "jira") return issue.jira_issue_key || null;
  return null;
}

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function sourceIssueLink({ config, issue = {} }) {
  const source = String(issue.source_system || "").toLowerCase();
  const key = sourceIssueKey(issue);
  const route = source === "backlog" ? "view" : source === "jira" ? "browse" : null;
  if (!key || !route) return null;
  const project = projectsApi().getProject({ config, projectId: issue.project_id });
  const baseUrl = source === "backlog" ? project.backlog_space_url : project.jira_site_url;
  if (!baseUrl) return null;

  try {
    const url = new URL(`/${route}/${encodeURIComponent(key)}`, baseUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeCanonicalSummary({ issue, summary }) {
  const text = String(summary || "");
  const key = String(sourceIssueKey(issue) || "").trim();
  if (!key) return text;
  const marker = `【${key}】`;
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `${marker}${text.replace(new RegExp(escaped, "gi"), "").trimStart()}`;
}

function normalizeCanonicalDescription({ config, issue, description }) {
  const text = String(description || "");
  if (!text.trim()) return text;
  const link = sourceIssueLink({ config, issue });
  if (!link) return text;
  const escaped = link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const body = text
    .replace(new RegExp(`^(?:\\s*${escaped}(?=\\s|$)\\s*)+`, "i"), "")
    .trimStart();
  return body ? `${link}\n\n${body}` : link;
}

module.exports = { normalizeCanonicalDescription, normalizeCanonicalSummary };
