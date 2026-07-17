const fs = require("fs");
const path = require("path");

const { AppError } = require("../../../http/errors/AppError");
const { BacklogRequestGateway } = require("../../../infrastructure/external/backlog/BacklogRequestGateway");
const {
  assertScopeOperation,
  createExternalAccessScope,
  scopeState,
} = require("../../../infrastructure/external/createExternalAccessScope");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function backlogDirectory(rows, { valueFor, nameFor, includeDisplayOrder = false } = {}) {
  return (rows || [])
    .map((row) => {
      const item = row || {};
      return {
        id: Number(item.id),
        value: String((valueFor || ((entry) => entry.name))(item) || "").trim(),
        name: String((nameFor || ((entry) => entry.name))(item) || "").trim(),
        ...(String(item.mailAddress || "").trim() ? { email: String(item.mailAddress).trim() } : {}),
        ...(includeDisplayOrder && Number.isSafeInteger(Number(item.displayOrder))
          ? { display_order: Number(item.displayOrder) }
          : {}),
      };
    })
    .filter((item) => Number.isSafeInteger(item.id) && item.id > 0 && item.value && item.name);
}

function statusDirectory(rows) {
  return backlogDirectory(rows, { includeDisplayOrder: true });
}

function userDirectory(rows) {
  return backlogDirectory(rows, {
    valueFor: (item) => item.mailAddress || item.userId || item.name,
    nameFor: (item) => item.name || item.userId || item.mailAddress,
  });
}

class BacklogClient {
  constructor({ project, gateway }) {
    this.project = project;
    this.gateway = gateway;
  }

  async getIssue(backlogIssueKey, options) {
    return this.gateway.execute("backlog.issue.get", { pathParams: { issueKey: backlogIssueKey }, options: { ...options, notFoundCode: "BACKLOG_ISSUE_NOT_FOUND" } });
  }

  async getIssueComments(backlogIssueKey) {
    return this.gateway.execute("backlog.issue.comments.list", { pathParams: { issueKey: backlogIssueKey } });
  }

  async getIssueAttachments(backlogIssueKey) {
    return this.gateway.execute("backlog.issue.attachments.list", { pathParams: { issueKey: backlogIssueKey } });
  }

  async downloadAttachment(backlogIssueKey, backlogAttachmentId) {
    return this.gateway.execute("backlog.issue.attachment.download", {
      pathParams: { issueKey: backlogIssueKey, attachmentId: backlogAttachmentId },
      responseType: "buffer",
    });
  }

  async getProject(projectIdOrKey, options) {
    return this.gateway.execute("backlog.project.get", { pathParams: { projectIdOrKey }, options: { ...options, notFoundCode: "BACKLOG_PROJECT_NOT_FOUND" } });
  }

  async getProjectStatuses(projectIdOrKey, options) {
    return this.gateway.execute("backlog.project.statuses.list", { pathParams: { projectIdOrKey }, options: { ...options, notFoundCode: "BACKLOG_PROJECT_NOT_FOUND" } });
  }

  async getProjectUsers(projectIdOrKey, options) {
    return this.gateway.execute("backlog.project.users.list", { pathParams: { projectIdOrKey }, options: { ...options, notFoundCode: "BACKLOG_PROJECT_NOT_FOUND" } });
  }

  async listIssues(params = {}, options) {
    return this.gateway.execute("backlog.issues.list", { query: params, options });
  }

  async pullMappingValues() {
    const projectKey = this.project.backlog_project_key;
    const [issueTypes, statuses, priorities, users, categories] = await Promise.all([
      this.gateway.execute("backlog.project.issue-types.list", { pathParams: { projectKey } }),
      this.gateway.execute("backlog.project.statuses.list", { pathParams: { projectIdOrKey: projectKey } }),
      this.gateway.execute("backlog.priorities.list"),
      this.gateway.execute("backlog.project.users.list", { pathParams: { projectIdOrKey: projectKey } }),
      this.gateway.execute("backlog.project.categories.list", { pathParams: { projectKey } }).catch((error) => {
        if (String(error.code || "").startsWith("EXTERNAL_")) throw error;
        return [];
      }),
    ]);

    return {
      issue_type: (issueTypes || []).map((item) => item.name).filter(Boolean),
      issue_type_directory: backlogDirectory(issueTypes),
      status: (statuses || []).map((item) => item.name).filter(Boolean),
      status_directory: statusDirectory(statuses),
      priority: (priorities || []).map((item) => item.name).filter(Boolean),
      priority_directory: backlogDirectory(priorities),
      user: (users || []).map((item) => item.mailAddress || item.userId || item.name).filter(Boolean),
      user_directory: userDirectory(users),
      cis_user_emails: (users || []).map((item) => item.mailAddress).filter(Boolean),
      component: (categories || []).map((item) => item.name).filter(Boolean),
      component_directory: backlogDirectory(categories),
    };
  }
}

class FixtureBacklogClient {
  constructor({ fixturePath }) {
    this.fixturePath = fixturePath;
    this.fixture = readJson(fixturePath);
  }

  issueByKey(backlogIssueKey) {
    const issues = this.fixture.issues || [this.fixture.issue].filter(Boolean);
    const token = String(backlogIssueKey);
    const issue = issues.find((item) => item.issueKey === token || item.key === token || String(item.id) === token);

    if (!issue) {
      throw new AppError({
        code: "BACKLOG_ISSUE_NOT_FOUND",
        message: "Fixture Backlog issue not found.",
        status: 404,
      });
    }

    return {
      ...issue,
      projectId: issue.projectId || this.fixture.projectId || 1,
      projectKey: issue.projectKey || this.fixture.projectKey || null,
    };
  }

  async getIssue(backlogIssueKey) {
    return this.issueByKey(backlogIssueKey);
  }

  async getIssueComments(backlogIssueKey) {
    const byIssue = this.fixture.commentsByIssue || {};
    if (byIssue[backlogIssueKey]) {
      return byIssue[backlogIssueKey];
    }

    return this.fixture.comments || [];
  }

  async getIssueAttachments(backlogIssueKey) {
    const byIssue = this.fixture.attachmentsByIssue || {};
    if (byIssue[backlogIssueKey]) {
      return byIssue[backlogIssueKey];
    }

    return this.fixture.attachments || [];
  }

  async downloadAttachment(backlogIssueKey, backlogAttachmentId) {
    const key = String(backlogAttachmentId);
    const downloads = this.fixture.attachmentDownloads || {};

    if (downloads[key] && downloads[key].fail) {
      const error = new Error(downloads[key].message || "Fixture attachment download failed.");
      error.statusCode = downloads[key].statusCode || 500;
      throw error;
    }

    const content = downloads[key] && downloads[key].content !== undefined
      ? downloads[key].content
      : `fixture attachment ${backlogIssueKey}/${backlogAttachmentId}`;

    return {
      body: Buffer.from(content, "utf8"),
      contentType: downloads[key] && downloads[key].contentType || "application/octet-stream",
    };
  }

  async getProject(projectIdOrKey) {
    return {
      id: this.fixture.projectId || 1,
      projectKey: projectIdOrKey,
    };
  }

  async listIssues(params = {}) {
    let issues = [...(this.fixture.issueCandidates || this.fixture.issues || [this.fixture.issue].filter(Boolean))]
      .map((issue) => ({ ...issue, projectId: issue.projectId || this.fixture.projectId || 1 }));
    const projectIds = params["projectId[]"] === undefined ? [] : [params["projectId[]"]].flat().map(Number);
    if (projectIds.length > 0) issues = issues.filter((issue) => projectIds.includes(Number(issue.projectId || this.fixture.projectId || 1)));
    const statusIds = params["statusId[]"] === undefined ? [] : [params["statusId[]"]].flat().map(Number);
    if (statusIds.length > 0) issues = issues.filter((issue) => statusIds.includes(Number(issue.status && issue.status.id)));
    const assigneeIds = params["assigneeId[]"] === undefined ? [] : [params["assigneeId[]"]].flat().map(Number);
    if (assigneeIds.length > 0) issues = issues.filter((issue) => assigneeIds.includes(Number(issue.assignee && issue.assignee.id)));
    if (params.createdSince) issues = issues.filter((issue) => String(issue.created || "").slice(0, 10) >= params.createdSince);
    if (params.createdUntil) issues = issues.filter((issue) => String(issue.created || "").slice(0, 10) <= params.createdUntil);
    if (params.sort === "created") issues.sort((a, b) => String(a.created || "").localeCompare(String(b.created || "")));
    if (params.order === "desc") issues.reverse();
    const offset = Number(params.offset || 0);
    const count = Number(params.count || 20);
    return issues.slice(offset, offset + count);
  }

  async getProjectStatuses() {
    if (this.fixture.statuses) return this.fixture.statuses;

    const issues = this.fixture.issueCandidates || this.fixture.issues || [this.fixture.issue].filter(Boolean);
    const statuses = new Map();
    for (const issue of issues) {
      const status = issue.status;
      if (status && status.id !== undefined && status.name) statuses.set(Number(status.id), { ...status });
    }
    return [...statuses.values()];
  }

  async getProjectUsers() {
    if (this.fixture.users) return this.fixture.users;

    const issues = this.fixture.issueCandidates || this.fixture.issues || [this.fixture.issue].filter(Boolean);
    const users = new Map();
    for (const issue of issues) {
      const user = issue.assignee;
      if (user && user.id !== undefined) users.set(Number(user.id), { ...user });
    }
    return [...users.values()];
  }

  async pullMappingValues() {
    const issues = this.fixture.issueCandidates || this.fixture.issues || [this.fixture.issue].filter(Boolean);
    const [statuses, users] = await Promise.all([this.getProjectStatuses(), this.getProjectUsers()]);
    const issueTypes = issues.map((issue) => issue.issueType).filter(Boolean);
    const priorities = issues.map((issue) => issue.priority).filter(Boolean);
    const categories = issues.flatMap((issue) => issue.category || issue.categories || [])
      .filter((category) => category && typeof category === "object");

    if (this.fixture.mappingValues) {
      return {
        ...this.fixture.mappingValues,
        issue_type_directory: this.fixture.mappingValues.issue_type_directory || backlogDirectory(issueTypes),
        status_directory: this.fixture.mappingValues.status_directory || statusDirectory(statuses),
        priority_directory: this.fixture.mappingValues.priority_directory || backlogDirectory(priorities),
        user_directory: this.fixture.mappingValues.user_directory || userDirectory(users),
        component_directory: this.fixture.mappingValues.component_directory || backlogDirectory(categories),
      };
    }

    const values = {
      issue_type: [],
      issue_type_directory: backlogDirectory(issueTypes),
      status: [],
      status_directory: statusDirectory(statuses),
      priority: [],
      priority_directory: backlogDirectory(priorities),
      user: [],
      user_directory: userDirectory(users),
      cis_user_emails: [],
      component: [],
      component_directory: backlogDirectory(categories),
    };
    const add = (key, value) => {
      const text = value === null || value === undefined ? "" : String(value).trim();
      if (text && !values[key].includes(text)) {
        values[key].push(text);
      }
    };

    for (const status of statuses) add("status", status.name);
    for (const user of users) {
      add("user", user.mailAddress || user.userId || user.name);
      add("cis_user_emails", user.mailAddress);
    }

    for (const issue of issues) {
      add("issue_type", issue.issueType && issue.issueType.name || issue.issue_type);
      add("priority", issue.priority && issue.priority.name || issue.priority);
      for (const category of issue.category || issue.categories || []) {
        add("component", category.name || category);
      }
    }

    return values;
  }
}

const BACKLOG_METHOD_OPERATIONS = Object.freeze({
  getIssue: ["backlog.issue.get"],
  getIssueComments: ["backlog.issue.comments.list"],
  getIssueAttachments: ["backlog.issue.attachments.list"],
  downloadAttachment: ["backlog.issue.attachment.download"],
  getProject: ["backlog.project.get"],
  getProjectStatuses: ["backlog.project.statuses.list"],
  getProjectUsers: ["backlog.project.users.list"],
  listIssues: ["backlog.issues.list"],
  pullMappingValues: [
    "backlog.project.issue-types.list",
    "backlog.project.statuses.list",
    "backlog.priorities.list",
    "backlog.project.users.list",
    "backlog.project.categories.list",
  ],
});

function guardedClient(client, scope, projectId) {
  return new Proxy(client, {
    get(target, property) {
      const value = target[property];
      if (typeof value !== "function" || !BACKLOG_METHOD_OPERATIONS[property]) return value;
      return (...args) => {
        BACKLOG_METHOD_OPERATIONS[property].forEach((operation) =>
          assertScopeOperation(scope, projectId, "backlog", operation)
        );
        return value.apply(target, args);
      };
    },
  });
}

function createBacklogClient({ config, projectId, externalAccessScope }) {
  const scope = externalAccessScope || createExternalAccessScope({ config, projectId });
  const { project } = scopeState(scope, projectId);
  if (config.backlog && config.backlog.fakeFixturePath) {
    return guardedClient(new FixtureBacklogClient({
      fixturePath: path.resolve(config.backlog.fakeFixturePath),
    }), scope, projectId);
  }

  return new BacklogClient({
    project,
    gateway: new BacklogRequestGateway({ scope, expectedProjectId: projectId }),
  });
}

module.exports = {
  BacklogClient,
  FixtureBacklogClient,
  createBacklogClient,
};
