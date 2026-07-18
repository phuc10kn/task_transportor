const fs = require("fs");
const path = require("path");

const { AppError } = require("../../../http/errors/AppError");
const { JiraGateway } = require("../../../infrastructure/external/providers/jira/JiraGateway");
const {
  assertScopeOperation,
  createExternalAccessScope,
  scopeState,
} = require("../../../infrastructure/external/core/createExternalAccessScope");
const { isExternalBoundaryError } = require("../../../infrastructure/external/core/policy");
const { markdownToAdf } = require("../support/jiraAdf");
const { jiraStoryPointFieldId } = require("../support/jiraDryRunPayload");
const { isRealJiraUserProfile, labelForJiraUser } = require("../support/realJiraUser");

function jiraError(code, message, status, details = {}) {
  const error = new AppError({
    code,
    message,
    status,
    details,
  });
  error.statusCode = status;
  return error;
}

function buildTraceLabel(backlogIssueKey) {
  if (!backlogIssueKey) {
    return null;
  }

  return `backlog-${String(backlogIssueKey).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function buildTraceJql({ projectKey, backlogIssueKey, issueId }) {
  const clauses = [];
  const traceLabel = buildTraceLabel(backlogIssueKey);

  if (backlogIssueKey) {
    clauses.push(`summary ~ "\\\"${backlogIssueKey}\\\""`);
    clauses.push(`description ~ "\\\"${backlogIssueKey}\\\""`);
  }

  if (traceLabel) {
    clauses.push(`labels = "${traceLabel}"`);
  }

  if (issueId) {
    clauses.push(`description ~ "\\\"${issueId}\\\""`);
  }

  const traceQuery = clauses.length > 0 ? clauses.join(" OR ") : `project = "${projectKey}"`;
  return `project = "${projectKey}" AND (${traceQuery}) ORDER BY created DESC`;
}

function asIssueRecord(issue) {
  return {
    id: issue.id || null,
    key: issue.key,
    summary: issue.fields && issue.fields.summary || "",
    description: issue.fields && issue.fields.description || null,
    labels: issue.fields && Array.isArray(issue.fields.labels) ? issue.fields.labels : [],
    status: issue.fields && issue.fields.status && issue.fields.status.name || null,
  };
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function issueFieldsForJira(fields = {}) {
  const {
    description,
    description_text,
    ...rest
  } = fields;

  return {
    ...rest,
    description: markdownToAdf(description_text !== undefined ? description_text : description),
  };
}

function jiraUserValue(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return user.emailAddress || user.accountId || user.name || null;
}

function jiraUserEmail(user) {
  return user && user.emailAddress || null;
}

function uniqueDirectory(entries) {
  const byId = new Map();
  for (const entry of entries || []) {
    const id = String(entry && entry.id || "").trim();
    const value = String(entry && entry.value || "").trim();
    const name = String(entry && entry.name || "").trim();
    if (!id || !value || !name) {
      continue;
    }
    byId.set(id, {
      id,
      value,
      name,
      ...(String(entry.email || "").trim() ? { email: String(entry.email).trim() } : {}),
    });
  }
  return [...byId.values()].sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
}

function namedDirectory(rows) {
  return uniqueDirectory((rows || []).map((item) => {
    const name = String(item && item.name || "").trim();
    return {
      id: item && item.id || name,
      value: name,
      name,
    };
  }));
}

function textDirectory(values, labels = {}) {
  return uniqueDirectory((values || []).map((value) => {
    const text = String(value || "").trim();
    return { id: text, value: text, name: labels[text] || text };
  }));
}

function withTextDirectories(mappingValues) {
  const values = mappingValues || {};
  return {
    ...values,
    issue_type_directory: values.issue_type_directory || textDirectory(values.issue_type),
    status_directory: values.status_directory || textDirectory(values.status),
    priority_directory: values.priority_directory || textDirectory(values.priority),
    user_directory: values.user_directory || textDirectory(values.user, values.user_labels),
    component_directory: values.component_directory || textDirectory(values.component),
  };
}

function roleActorUser(actor) {
  if (!actor || typeof actor !== "object") {
    return null;
  }

  return actor.actorUser
    ? {
        ...actor.actorUser,
        displayName: actor.actorUser.displayName || actor.displayName,
      }
    : null;
}

function collectUserValues(users) {
  const values = [];
  const emails = [];
  const labels = {};
  const directory = [];
  const add = (target, value) => {
    const text = String(value || "").trim();
    if (text && !target.includes(text)) {
      target.push(text);
    }
  };

  for (const user of users || []) {
    if (!isRealJiraUserProfile(user)) {
      continue;
    }

    const value = jiraUserValue(user);
    add(values, value);
    add(emails, jiraUserEmail(user));
    const label = labelForJiraUser(user);
    if (value && label) {
      labels[value] = label;
    }
    directory.push({
      id: user.accountId || value,
      value,
      name: label || value,
      ...(jiraUserEmail(user) ? { email: jiraUserEmail(user) } : {}),
    });
  }

  return { values, emails, labels, directory: uniqueDirectory(directory) };
}

function loadFakeState(config) {
  const statePath = config.jira.fakeStatePath
    || path.join(config.storage.root, "jira-fake-state.json");

  if (!fs.existsSync(statePath)) {
    const seed = config.jira.fakeSeedPath && fs.existsSync(config.jira.fakeSeedPath)
      ? JSON.parse(fs.readFileSync(config.jira.fakeSeedPath, "utf8"))
      : {
          issueCounter: 1,
          commentCounter: 1,
          issues: [],
          failures: {},
        };

    ensureParentDir(statePath);
    fs.writeFileSync(statePath, JSON.stringify(seed, null, 2));
  }

  return {
    path: statePath,
    state: JSON.parse(fs.readFileSync(statePath, "utf8")),
  };
}

function saveFakeState(container) {
  ensureParentDir(container.path);
  fs.writeFileSync(container.path, JSON.stringify(container.state, null, 2));
}

class FakeJiraClient {
  constructor({ config, project }) {
    this.config = config;
    this.project = project;
  }

  getStore() {
    return loadFakeState(this.config);
  }

  maybeFail(operation) {
    const container = this.getStore();
    const failures = container.state.failures && container.state.failures[operation];
    if (!Array.isArray(failures) || failures.length === 0) {
      return null;
    }

    const failure = failures.shift();
    saveFakeState(container);

    const error = jiraError(
      failure.code || "JIRA_FAKE_ERROR",
      failure.message || `${operation} failed in fake Jira client.`,
      failure.statusCode || 500,
      failure.details || {}
    );
    error.retryable = failure.retryable !== undefined
      ? Boolean(failure.retryable)
      : (error.statusCode === 429 || error.statusCode >= 500);
    error.retryAfterSeconds = failure.retryAfterSeconds || null;
    throw error;
  }

  searchIssuesByTrace({ backlogIssueKey, issueId }) {
    this.maybeFail("searchIssuesByTrace");
    const container = this.getStore();
    const traceLabel = buildTraceLabel(backlogIssueKey);
    const matches = (container.state.issues || []).filter((issue) => {
      if (issue.projectKey && String(issue.projectKey).toUpperCase() !== String(this.project.jira_project_key || "").toUpperCase()) {
        return false;
      }
      const labels = Array.isArray(issue.labels) ? issue.labels : [];
      const description = String(issue.description || "");
      const summary = String(issue.summary || "");

      return (
        (backlogIssueKey && (summary.includes(backlogIssueKey) || description.includes(backlogIssueKey)))
        || (traceLabel && labels.includes(traceLabel))
        || (issueId && description.includes(issueId))
      );
    });

    return matches.map((issue) => ({
      id: issue.id || null,
      key: issue.key,
      summary: issue.summary || "",
      description: issue.description || null,
      labels: issue.labels || [],
      status: issue.status || null,
    }));
  }

  getIssue(issueKey) {
    this.maybeFail("getIssue");
    const container = this.getStore();
    const token = String(issueKey);
    const issue = (container.state.issues || []).find((item) => item.key === token || String(item.id) === token);
    if (!issue) {
      throw jiraError("JIRA_ISSUE_NOT_FOUND", `No Jira issue found with key '${issueKey}'.`, 404);
    }

    return {
      id: issue.id || null,
      key: issue.key,
      fields: {
        summary: issue.summary || "",
        description: issue.description || null,
        labels: issue.labels || [],
        status: issue.status ? { name: issue.status } : null,
        project: { key: issue.projectKey || this.project.jira_project_key },
      },
    };
  }

  createIssue(payload) {
    this.maybeFail("createIssue");
    if (payload.fields && Object.prototype.hasOwnProperty.call(payload.fields, "description_text")) {
      throw jiraError(
        "JIRA_FAKE_UNSUPPORTED_FIELD",
        "Fake Jira client does not accept helper field 'description_text'.",
        422
      );
    }
    const container = this.getStore();
    const key = `${this.project.jira_project_key}-${container.state.issueCounter || 1}`;
    container.state.issueCounter = (container.state.issueCounter || 1) + 1;
    const issue = {
      id: String(container.state.issueCounter),
      key,
      summary: payload.fields.summary,
      description: payload.fields.description,
      labels: payload.fields.labels || [],
      issue_type: payload.fields.issuetype && payload.fields.issuetype.name || null,
      priority: payload.fields.priority && payload.fields.priority.name || null,
      assignee: payload.fields.assignee && (payload.fields.assignee.accountId || payload.fields.assignee.name) || null,
      reporter: payload.fields.reporter && (payload.fields.reporter.accountId || payload.fields.reporter.name) || null,
      due_date: payload.fields.duedate || null,
      story_point: payload.fields[jiraStoryPointFieldId(this.project, payload.fields.issuetype && payload.fields.issuetype.name)] ?? null,
      status: "Created",
      comments: [],
    };
    container.state.issues = container.state.issues || [];
    container.state.issues.push(issue);
    saveFakeState(container);
    return { id: issue.id, key: issue.key };
  }

  updateIssue(issueKey, payload) {
    this.maybeFail("updateIssue");
    if (payload.fields && Object.prototype.hasOwnProperty.call(payload.fields, "description_text")) {
      throw jiraError(
        "JIRA_FAKE_UNSUPPORTED_FIELD",
        "Fake Jira client does not accept helper field 'description_text'.",
        422
      );
    }
    const container = this.getStore();
    const issue = (container.state.issues || []).find((item) => item.key === issueKey);
    if (!issue) {
      throw jiraError("JIRA_ISSUE_NOT_FOUND", `No Jira issue found with key '${issueKey}'.`, 404);
    }

    issue.summary = payload.fields.summary;
    issue.description = payload.fields.description;
    issue.labels = payload.fields.labels || [];
    issue.issue_type = payload.fields.issuetype && payload.fields.issuetype.name || issue.issue_type;
    issue.priority = payload.fields.priority && payload.fields.priority.name || issue.priority;
    issue.assignee = payload.fields.assignee && (payload.fields.assignee.accountId || payload.fields.assignee.name) || issue.assignee;
    issue.reporter = payload.fields.reporter && (payload.fields.reporter.accountId || payload.fields.reporter.name) || issue.reporter;
    issue.due_date = payload.fields.duedate || issue.due_date || null;
    issue.story_point = payload.fields[jiraStoryPointFieldId(this.project, payload.fields.issuetype && payload.fields.issuetype.name)] ?? issue.story_point ?? null;
    saveFakeState(container);
    return { key: issue.key };
  }

  transitionIssue(issueKey, statusName) {
    this.maybeFail("transitionIssue");
    const container = this.getStore();
    const issue = (container.state.issues || []).find((item) => item.key === issueKey);
    if (!issue) {
      throw jiraError("JIRA_ISSUE_NOT_FOUND", `No Jira issue found with key '${issueKey}'.`, 404);
    }

    issue.status = statusName;
    saveFakeState(container);
    return { transitioned: true };
  }

  addComment(issueKey, commentText) {
    this.maybeFail("addComment");
    const container = this.getStore();
    const issue = (container.state.issues || []).find((item) => item.key === issueKey);
    if (!issue) {
      throw jiraError("JIRA_ISSUE_NOT_FOUND", `No Jira issue found with key '${issueKey}'.`, 404);
    }

    const commentId = String(container.state.commentCounter || 1);
    container.state.commentCounter = (container.state.commentCounter || 1) + 1;
    issue.comments = issue.comments || [];
    issue.comments.push({
      id: commentId,
      body: commentText,
    });
    saveFakeState(container);
    return { id: commentId };
  }

  pullMappingValues() {
    this.maybeFail("pullMappingValues");
    const container = this.getStore();
    return withTextDirectories(container.state.mappingValues || {
      issue_type: ["Bug", "Task", "Story"],
      status: ["To Do", "In Progress", "Done"],
      priority: ["Low", "Medium", "High"],
      user: ["fake-jira-user@example.test"],
      cis_user_emails: ["fake-jira-user@example.test"],
      component: ["Frontend", "Backend"],
    });
  }

  async resolveUserAccountId(userValue) {
    const value = String(userValue || "").trim();
    if (!value.includes("@")) {
      return value;
    }

    const container = this.getStore();
    const users = container.state.users || [
      { emailAddress: "fake-jira-user@example.test", accountId: "fake-jira-account-1" },
    ];
    const match = users.find((user) =>
      String(user.emailAddress || "").toLowerCase() === value.toLowerCase()
    );

    return match && match.accountId || value;
  }
}

class JiraClient {
  constructor({ project, gateway }) {
    this.project = project;
    this.gateway = gateway;
  }

  async getIssue(issueKey) {
    const response = await this.gateway.execute("jira.issue.get", { pathParams: { issueKey },
      query: {
        fields: "summary,description,labels,status,project",
      },
    });
    return response.body;
  }

  async searchIssuesByTrace({ backlogIssueKey, issueId }) {
    const response = await this.gateway.execute("jira.issues.search", {
      query: {
        jql: buildTraceJql({
          projectKey: this.project.jira_project_key,
          backlogIssueKey,
          issueId,
        }),
        fields: "summary,description,labels,status",
        maxResults: 10,
      },
    });

    const issues = response.body && Array.isArray(response.body.issues)
      ? response.body.issues
      : [];
    return issues.map(asIssueRecord);
  }

  async createIssue(payload) {
    const response = await this.gateway.execute("jira.issue.create", {
      body: {
        fields: issueFieldsForJira(payload.fields),
      },
    });
    return response.body;
  }

  async updateIssue(issueKey, payload) {
    await this.gateway.execute("jira.issue.update", { pathParams: { issueKey },
      body: {
        fields: issueFieldsForJira(payload.fields),
      },
    });
    return { key: issueKey };
  }

  async transitionIssue(issueKey, statusName) {
    const transitionsResponse = await this.gateway.execute("jira.issue.transitions.list", { pathParams: { issueKey } });
    const transitions = transitionsResponse.body && Array.isArray(transitionsResponse.body.transitions)
      ? transitionsResponse.body.transitions
      : [];
    const match = transitions.find((transition) => {
      const target = transition.to && transition.to.name || "";
      return transition.name === statusName || target === statusName;
    });

    if (!match) {
      throw jiraError(
        "JIRA_TRANSITION_NOT_FOUND",
        `Jira transition for status '${statusName}' was not found.`,
        422,
        { jira_issue_key: issueKey, status: statusName }
      );
    }

    await this.gateway.execute("jira.issue.transition", { pathParams: { issueKey },
      body: {
        transition: { id: match.id },
      },
    });

    return { transitioned: true, transition_id: match.id };
  }

  async addComment(issueKey, commentText) {
    const response = await this.gateway.execute("jira.issue.comment.create", { pathParams: { issueKey },
      body: {
        body: markdownToAdf(commentText),
      },
    });
    return response.body;
  }

  async resolveUserAccountId(userValue) {
    const value = String(userValue || "").trim();
    if (!value || !value.includes("@")) {
      return value;
    }

    const response = await this.gateway.execute("jira.users.search", {
      query: {
        query: value,
        maxResults: 50,
      },
    });
    const users = Array.isArray(response.body) ? response.body : [];
    const exact = users.find((user) => String(user.emailAddress || "").toLowerCase() === value.toLowerCase());
    const match = exact || users[0];

    if (!match || !match.accountId) {
      throw jiraError("JIRA_USER_NOT_FOUND", `Jira user '${value}' was not found.`, 422, {
        email: value,
      });
    }

    return match.accountId;
  }

  async pullMappingValues() {
    const projectKey = this.project.jira_project_key;
    const projectStatusesResponse = await this.gateway.execute("jira.project.statuses.list", { pathParams: { projectKey } });
    const projectStatuses = Array.isArray(projectStatusesResponse.body)
      ? projectStatusesResponse.body
      : [];
    const prioritiesResponse = await this.gateway.execute("jira.priorities.list");
    const componentsResponse = await this.gateway.execute("jira.project.components.list", { pathParams: { projectKey } });
    const optional = (promise, fallback) => promise.catch((error) => {
      if (isExternalBoundaryError(error)) throw error;
      return fallback;
    });
    const assignableUsersResponse = await optional(this.gateway.execute("jira.users.assignable.list", {
      query: {
        project: projectKey,
        maxResults: 100,
      },
    }), { body: [] });
    const multiProjectUsersResponse = await optional(this.gateway.execute("jira.users.assignable.multi-project.list", {
      query: {
        projectKeys: projectKey,
        maxResults: 100,
      },
    }), { body: [] });
    const projectRolesResponse = await optional(
      this.gateway.execute("jira.project.roles.list", { pathParams: { projectKey } }),
      { body: {} }
    );
    const roleUrls = Object.values(projectRolesResponse.body || {})
      .filter((value) => typeof value === "string");
    const roleIds = roleUrls.map((url) => String(url).match(/\/role\/(\d+)(?:$|[?#])/)?.[1]).filter(Boolean);
    const roleResponses = await Promise.all(roleIds.map((roleId) => optional(
      this.gateway.execute("jira.project.role-actors.list", { pathParams: { projectKey, roleId } }),
      { body: { actors: [] } }
    )));
    const roleUsers = roleResponses.flatMap((response) =>
      (response.body && response.body.actors || [])
        .map(roleActorUser)
        .filter(Boolean)
    );
    const userValues = collectUserValues([
      ...(assignableUsersResponse.body || []),
      ...(multiProjectUsersResponse.body || []),
      ...roleUsers,
    ]);

    const statusNames = [];
    const statusRows = [];
    for (const issueType of projectStatuses) {
      for (const status of issueType.statuses || []) {
        if (status && status.name && !statusNames.includes(status.name)) {
          statusNames.push(status.name);
        }
        if (status) {
          statusRows.push(status);
        }
      }
    }

    return {
      issue_type: projectStatuses.map((item) => item.name).filter(Boolean),
      issue_type_directory: namedDirectory(projectStatuses),
      status: statusNames,
      status_directory: namedDirectory(statusRows),
      priority: (prioritiesResponse.body || []).map((item) => item.name).filter(Boolean),
      priority_directory: namedDirectory(prioritiesResponse.body),
      user: userValues.values,
      user_labels: userValues.labels,
      user_directory: userValues.directory,
      cis_user_emails: userValues.emails,
      component: (componentsResponse.body || []).map((item) => item.name).filter(Boolean),
      component_directory: namedDirectory(componentsResponse.body),
    };
  }
}

const JIRA_METHOD_OPERATIONS = Object.freeze({
  getIssue: ["jira.issue.get"],
  searchIssuesByTrace: ["jira.issues.search"],
  createIssue: ["jira.issue.create"],
  updateIssue: ["jira.issue.update"],
  transitionIssue: ["jira.issue.transitions.list", "jira.issue.transition"],
  addComment: ["jira.issue.comment.create"],
  resolveUserAccountId: ["jira.users.search"],
  pullMappingValues: [
    "jira.project.statuses.list",
    "jira.priorities.list",
    "jira.project.components.list",
    "jira.users.assignable.list",
    "jira.users.assignable.multi-project.list",
    "jira.project.roles.list",
    "jira.project.role-actors.list",
  ],
});

function guardedClient(client, scope, projectId) {
  return new Proxy(client, {
    get(target, property) {
      const value = target[property];
      if (typeof value !== "function" || !JIRA_METHOD_OPERATIONS[property]) return value;
      return (...args) => {
        JIRA_METHOD_OPERATIONS[property].forEach((operation) =>
          assertScopeOperation(scope, projectId, "jira", operation)
        );
        return value.apply(target, args);
      };
    },
  });
}

function createJiraClient({ config, projectId, externalAccessScope }) {
  const scope = externalAccessScope || createExternalAccessScope({ config, projectId });
  const { project } = scopeState(scope, projectId);
  if (config.jira && config.jira.fakeMode) {
    return guardedClient(new FakeJiraClient({ config, project }), scope, projectId);
  }

  return new JiraClient({
    project,
    gateway: new JiraGateway({ scope, expectedProjectId: projectId }),
  });
}

module.exports = {
  JiraClient,
  buildTraceLabel,
  buildTraceJql,
  createJiraClient,
  jiraError,
};
