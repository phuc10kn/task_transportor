const READ = "backlog_external_read_enabled";
const operation = (method, template, path) => Object.freeze({ capability: READ, access: "reads", method, template, path });
const part = (value) => encodeURIComponent(String(value));

const BACKLOG_OPERATIONS = Object.freeze({
  "backlog.issue.get": operation("GET", "/api/v2/issues/:issueKey", ({ issueKey }) => `/api/v2/issues/${part(issueKey)}`),
  "backlog.issue.comments.list": operation("GET", "/api/v2/issues/:issueKey/comments", ({ issueKey }) => `/api/v2/issues/${part(issueKey)}/comments`),
  "backlog.issue.attachments.list": operation("GET", "/api/v2/issues/:issueKey/attachments", ({ issueKey }) => `/api/v2/issues/${part(issueKey)}/attachments`),
  "backlog.issue.attachment.download": operation("GET", "/api/v2/issues/:issueKey/attachments/:attachmentId", ({ issueKey, attachmentId }) => `/api/v2/issues/${part(issueKey)}/attachments/${part(attachmentId)}`),
  "backlog.project.get": operation("GET", "/api/v2/projects/:projectIdOrKey", ({ projectIdOrKey }) => `/api/v2/projects/${part(projectIdOrKey)}`),
  "backlog.project.statuses.list": operation("GET", "/api/v2/projects/:projectIdOrKey/statuses", ({ projectIdOrKey }) => `/api/v2/projects/${part(projectIdOrKey)}/statuses`),
  "backlog.project.users.list": operation("GET", "/api/v2/projects/:projectIdOrKey/users", ({ projectIdOrKey }) => `/api/v2/projects/${part(projectIdOrKey)}/users`),
  "backlog.issues.count": operation("GET", "/api/v2/issues/count", () => "/api/v2/issues/count"),
  "backlog.issues.list": operation("GET", "/api/v2/issues", () => "/api/v2/issues"),
  "backlog.project.issue-types.list": operation("GET", "/api/v2/projects/:projectKey/issueTypes", ({ projectKey }) => `/api/v2/projects/${part(projectKey)}/issueTypes`),
  "backlog.priorities.list": operation("GET", "/api/v2/priorities", () => "/api/v2/priorities"),
  "backlog.project.categories.list": operation("GET", "/api/v2/projects/:projectKey/categories", ({ projectKey }) => `/api/v2/projects/${part(projectKey)}/categories`),
});

module.exports = { BACKLOG_OPERATIONS };
