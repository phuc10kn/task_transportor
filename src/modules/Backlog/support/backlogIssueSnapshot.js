const { AppError } = require("../../../http/errors/AppError");

function valueSnapshot(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return value;
  return Object.fromEntries(["id", "name", "userId", "mailAddress"]
    .filter((key) => value[key] !== undefined)
    .map((key) => [key, value[key]]));
}

function buildBacklogIssueSnapshot(row, { remoteProjectId, projectKey }) {
  const issueKey = String(row && (row.issueKey || row.key) || "").trim().toUpperCase();
  const valid = issueKey
    && Number(row && row.projectId) === Number(remoteProjectId)
    && typeof row.summary === "string"
    && typeof row.description === "string"
    && row.issueType && row.status && row.priority;
  if (!valid) return null;
  return {
    version: 1,
    issueKey,
    projectId: Number(row.projectId),
    projectKey: String(row.projectKey || projectKey || "").trim(),
    summary: row.summary,
    description: row.description,
    issueType: valueSnapshot(row.issueType),
    status: valueSnapshot(row.status),
    priority: valueSnapshot(row.priority),
    assignee: valueSnapshot(row.assignee),
    created: row.created || null,
    updated: row.updated || null,
  };
}

function validateBacklogIssueSnapshot(snapshot, { backlogIssueKey, project }) {
  const expectedKey = String(backlogIssueKey || "").trim().toUpperCase();
  const valid = snapshot
    && snapshot.version === 1
    && String(snapshot.issueKey || "").trim().toUpperCase() === expectedKey
    && Number.isSafeInteger(Number(snapshot.projectId))
    && Number(snapshot.projectId) > 0
    && String(snapshot.projectKey || "").trim() === String(project.backlog_project_key || "").trim()
    && typeof snapshot.summary === "string"
    && typeof snapshot.description === "string"
    && snapshot.issueType && snapshot.status && snapshot.priority;
  if (!valid) {
    throw new AppError({
      code: "BACKLOG_PULL_SNAPSHOT_INVALID",
      message: "manual_pull job contains an invalid Backlog issue snapshot.",
      status: 422,
    });
  }
  return snapshot;
}

module.exports = { buildBacklogIssueSnapshot, validateBacklogIssueSnapshot };
