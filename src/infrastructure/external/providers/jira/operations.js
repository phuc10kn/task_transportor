const READ = "jira_external_read_enabled";
const WRITE = "jira_external_write_enabled";
const operation = (capability, access, method, template, path) => Object.freeze({ capability, access, method, template, path });
const part = (value) => encodeURIComponent(String(value));

const JIRA_OPERATIONS = Object.freeze({
  "jira.issue.get": operation(READ, "reads", "GET", "/rest/api/3/issue/:issueKey", ({ issueKey }) => `/rest/api/3/issue/${part(issueKey)}`),
  "jira.issues.search": operation(READ, "reads", "GET", "/rest/api/3/search/jql", () => "/rest/api/3/search/jql"),
  "jira.issue.create": operation(WRITE, "writes", "POST", "/rest/api/3/issue", () => "/rest/api/3/issue"),
  "jira.issue.update": operation(WRITE, "writes", "PUT", "/rest/api/3/issue/:issueKey", ({ issueKey }) => `/rest/api/3/issue/${part(issueKey)}`),
  "jira.issue.transitions.list": operation(READ, "reads", "GET", "/rest/api/3/issue/:issueKey/transitions", ({ issueKey }) => `/rest/api/3/issue/${part(issueKey)}/transitions`),
  "jira.issue.transition": operation(WRITE, "writes", "POST", "/rest/api/3/issue/:issueKey/transitions", ({ issueKey }) => `/rest/api/3/issue/${part(issueKey)}/transitions`),
  "jira.issue.comment.create": operation(WRITE, "writes", "POST", "/rest/api/3/issue/:issueKey/comment", ({ issueKey }) => `/rest/api/3/issue/${part(issueKey)}/comment`),
  "jira.users.search": operation(READ, "reads", "GET", "/rest/api/3/user/search", () => "/rest/api/3/user/search"),
  "jira.project.statuses.list": operation(READ, "reads", "GET", "/rest/api/3/project/:projectKey/statuses", ({ projectKey }) => `/rest/api/3/project/${part(projectKey)}/statuses`),
  "jira.priorities.list": operation(READ, "reads", "GET", "/rest/api/3/priority", () => "/rest/api/3/priority"),
  "jira.project.components.list": operation(READ, "reads", "GET", "/rest/api/3/project/:projectKey/components", ({ projectKey }) => `/rest/api/3/project/${part(projectKey)}/components`),
  "jira.users.assignable.list": operation(READ, "reads", "GET", "/rest/api/3/user/assignable/search", () => "/rest/api/3/user/assignable/search"),
  "jira.users.assignable.multi-project.list": operation(READ, "reads", "GET", "/rest/api/3/user/assignable/multiProjectSearch", () => "/rest/api/3/user/assignable/multiProjectSearch"),
  "jira.project.roles.list": operation(READ, "reads", "GET", "/rest/api/3/project/:projectKey/role", ({ projectKey }) => `/rest/api/3/project/${part(projectKey)}/role`),
  "jira.project.role-actors.list": operation(READ, "reads", "GET", "/rest/api/3/project/:projectKey/role/:roleId", ({ projectKey, roleId }) => `/rest/api/3/project/${part(projectKey)}/role/${part(roleId)}`),
});

module.exports = { JIRA_OPERATIONS };
