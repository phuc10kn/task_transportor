const { AppError } = require("../../../../http/errors/AppError");
const { assertScopeOperation, scopeState } = require("../../core/createExternalAccessScope");
const { providerOrigin } = require("../../core/policy");
const { createHttpTransport } = require("../../transports/http/HttpTransport");

function messageFromBody(body, fallback) {
  if (!body || typeof body !== "object") return fallback;
  if (Array.isArray(body.errorMessages) && body.errorMessages.length) return body.errorMessages.join(" ");
  if (body.errors && typeof body.errors === "object") {
    const text = Object.entries(body.errors).map(([key, value]) => `${key}: ${value}`).join(" ");
    if (text) return text;
  }
  return fallback;
}

function parseRetryAfter(value) {
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) return seconds;
  const date = Date.parse(value);
  const diff = Math.ceil((date - Date.now()) / 1000);
  return Number.isFinite(diff) && diff > 0 ? diff : null;
}

function jiraError(code, message, status, details = {}) {
  const error = new AppError({ code, message, status, details });
  error.statusCode = status;
  return error;
}

class JiraGateway {
  constructor({ scope, expectedProjectId, transport }) {
    this.scope = scope;
    this.expectedProjectId = expectedProjectId;
    const { config, project } = scopeState(scope, expectedProjectId);
    this.config = config;
    this.project = project;
    this.timeoutMs = Math.max(1, Number(config.jira.requestTimeoutSeconds || 10)) * 1000;
    this.transport = transport || createHttpTransport();
  }

  async execute(operation, { pathParams = {}, query = {}, body } = {}) {
    const { definition } = assertScopeOperation(this.scope, this.expectedProjectId, "jira", operation);
    const origin = providerOrigin(this.project.jira_site_url, "jira_site_url");
    const email = this.project.jira_email || "";
    const apiToken = this.project.jira_api_token || "";
    if (!email) throw jiraError("JIRA_CREDENTIAL_REQUIRED", "Jira email is not configured.", 422, { field: "jira_email" });
    if (!apiToken) throw jiraError("JIRA_CREDENTIAL_REQUIRED", "Jira API token is not configured.", 422, { field: "jira_api_token" });
    const pathname = definition.path(pathParams);
    const url = new URL(pathname, `${origin}/`);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    }
    try {
      const response = await this.transport.request({
        url,
        method: definition.method,
        headers: {
          Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        logBody: body,
        timeoutMs: this.timeoutMs,
        observability: { config: this.config, provider: "jira", operation },
      });
      const rawText = response.rawText;
      let parsed = null;
      if (rawText) {
        try { parsed = JSON.parse(rawText); } catch (_error) { parsed = { raw_text: rawText }; }
      }
      if (!response.ok) {
        const status = response.status;
        const error = jiraError(
          status === 401 || status === 403 ? "JIRA_AUTH_FAILED"
            : status === 404 ? "JIRA_RESOURCE_NOT_FOUND"
              : status === 429 ? "JIRA_RATE_LIMITED"
                : status >= 500 ? "JIRA_SERVER_ERROR" : "JIRA_API_ERROR",
          messageFromBody(parsed, `Jira API failed with status ${status}.`),
          status >= 500 ? 502 : 422,
          { jira_status_code: status, jira_operation: operation }
        );
        error.statusCode = status;
        error.retryable = status === 429 || status >= 500;
        error.retryAfterSeconds = status === 429 ? parseRetryAfter(response.headers.get("retry-after")) : null;
        throw error;
      }
      return { body: parsed, headers: response.headers };
    } catch (error) {
      if (error && error.code === "EXTERNAL_HTTP_TIMEOUT") {
        const timeoutError = jiraError("JIRA_REQUEST_TIMEOUT", "Jira API request timed out.", 504, { jira_operation: operation });
        timeoutError.retryable = true;
        throw timeoutError;
      }
      if (error instanceof AppError) throw error;
      const networkError = jiraError("JIRA_NETWORK_ERROR", `Jira API request failed: ${error.message}`, 502, { jira_operation: operation });
      networkError.retryable = true;
      throw networkError;
    }
  }
}

module.exports = { JiraGateway };
