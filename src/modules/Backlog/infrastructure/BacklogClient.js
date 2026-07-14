const fs = require("fs");
const https = require("https");
const path = require("path");

const { AppError } = require("../../../http/errors/AppError");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function retryAfterSeconds(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function requestJson(url, { timeoutMs = 10000, notFoundCode = "BACKLOG_API_ERROR" } = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
        let body = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode >= 400) {
            const code = res.statusCode === 404
              ? notFoundCode
              : res.statusCode === 429
                ? "BACKLOG_RATE_LIMITED"
                : res.statusCode === 401 || res.statusCode === 403
                  ? "BACKLOG_AUTH_FAILED"
                  : res.statusCode >= 500 ? "BACKLOG_SERVER_ERROR" : "BACKLOG_API_ERROR";
            const error = new AppError({
              code,
              message: `Backlog API failed with ${res.statusCode}.`,
              status: res.statusCode === 429 ? 429 : res.statusCode >= 500 ? 502 : 422,
              details: {
                backlog_status_code: res.statusCode,
              },
            });
            error.statusCode = res.statusCode;
            error.retryable = res.statusCode === 429 || res.statusCode >= 500;
            error.retryAfterSeconds = retryAfterSeconds(res.headers["retry-after"]);
            reject(error);
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      });
    request.setTimeout(Math.max(1, timeoutMs), () => {
      const error = new AppError({ code: "BACKLOG_REQUEST_TIMEOUT", message: "Backlog API request timed out.", status: 504 });
      error.retryable = true;
      request.destroy(error);
    });
    request.on("error", (error) => {
      if (error instanceof AppError) return reject(error);
      const network = new AppError({ code: "BACKLOG_NETWORK_ERROR", message: "Backlog API network request failed.", status: 502 });
      network.retryable = true;
      network.cause = error;
      reject(network);
    });
  });
}

function requestBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });
        res.on("end", () => {
          const body = Buffer.concat(chunks);
          if (res.statusCode >= 400) {
            reject(new AppError({
              code: res.statusCode >= 500 ? "BACKLOG_SERVER_ERROR" : "BACKLOG_API_ERROR",
              message: `Backlog API failed with ${res.statusCode}.`,
              status: res.statusCode >= 500 ? 502 : 422,
              details: {
                backlog_status_code: res.statusCode,
              },
            }));
            return;
          }

          resolve({
            body,
            contentType: res.headers["content-type"] || null,
          });
        });
      })
      .on("error", reject);
  });
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
  constructor({ project }) {
    this.project = project;
    this.apiKey = project.backlog_api_key || "";

    if (!this.apiKey) {
      throw new AppError({
        code: "BACKLOG_CREDENTIAL_REQUIRED",
        message: "Backlog API key is not configured.",
        status: 422,
      });
    }

    if (!project.backlog_space_url) {
      throw new AppError({
        code: "BACKLOG_CONFIG_REQUIRED",
        message: "Backlog space URL is required.",
        status: 422,
      });
    }
  }

  buildUrl(pathname, params = {}) {
    const url = new URL(pathname, this.project.backlog_space_url);
    url.searchParams.set("apiKey", this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item));
      } else {
        url.searchParams.set(key, value);
      }
    }

    return url;
  }

  async getIssue(backlogIssueKey, options) {
    return requestJson(this.buildUrl(`/api/v2/issues/${encodeURIComponent(backlogIssueKey)}`), { ...options, notFoundCode: "BACKLOG_ISSUE_NOT_FOUND" });
  }

  async getIssueComments(backlogIssueKey) {
    return requestJson(this.buildUrl(`/api/v2/issues/${encodeURIComponent(backlogIssueKey)}/comments`));
  }

  async getIssueAttachments(backlogIssueKey) {
    return requestJson(this.buildUrl(`/api/v2/issues/${encodeURIComponent(backlogIssueKey)}/attachments`));
  }

  async downloadAttachment(backlogIssueKey, backlogAttachmentId) {
    return requestBuffer(
      this.buildUrl(
        `/api/v2/issues/${encodeURIComponent(backlogIssueKey)}/attachments/${encodeURIComponent(backlogAttachmentId)}`
      )
    );
  }

  async getProject(projectIdOrKey, options) {
    return requestJson(this.buildUrl(`/api/v2/projects/${encodeURIComponent(projectIdOrKey)}`), { ...options, notFoundCode: "BACKLOG_PROJECT_NOT_FOUND" });
  }

  async getProjectStatuses(projectIdOrKey, options) {
    return requestJson(this.buildUrl(`/api/v2/projects/${encodeURIComponent(projectIdOrKey)}/statuses`), { ...options, notFoundCode: "BACKLOG_PROJECT_NOT_FOUND" });
  }

  async getProjectUsers(projectIdOrKey, options) {
    return requestJson(this.buildUrl(`/api/v2/projects/${encodeURIComponent(projectIdOrKey)}/users`), { ...options, notFoundCode: "BACKLOG_PROJECT_NOT_FOUND" });
  }

  async listIssues(params = {}, options) {
    return requestJson(this.buildUrl("/api/v2/issues", params), options);
  }

  async pullMappingValues() {
    const projectKey = this.project.backlog_project_key;
    const [issueTypes, statuses, priorities, users, categories] = await Promise.all([
      requestJson(this.buildUrl(`/api/v2/projects/${encodeURIComponent(projectKey)}/issueTypes`)),
      requestJson(this.buildUrl(`/api/v2/projects/${encodeURIComponent(projectKey)}/statuses`)),
      requestJson(this.buildUrl("/api/v2/priorities")),
      requestJson(this.buildUrl(`/api/v2/projects/${encodeURIComponent(projectKey)}/users`)),
      requestJson(this.buildUrl(`/api/v2/projects/${encodeURIComponent(projectKey)}/categories`)).catch(() => []),
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

function createBacklogClient({ config, project }) {
  if (config.backlog && config.backlog.fakeFixturePath) {
    return new FixtureBacklogClient({
      fixturePath: path.resolve(config.backlog.fakeFixturePath),
    });
  }

  return new BacklogClient({ project });
}

module.exports = {
  BacklogClient,
  FixtureBacklogClient,
  createBacklogClient,
};
