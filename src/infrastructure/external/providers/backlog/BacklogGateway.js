const { AppError } = require("../../../../http/errors/AppError");
const { assertScopeOperation, scopeState } = require("../../core/createExternalAccessScope");
const { providerOrigin } = require("../../core/policy");
const { createHttpTransport } = require("../../transports/http/HttpTransport");

function retryAfterSeconds(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

class BacklogGateway {
  constructor({ scope, expectedProjectId, transport }) {
    this.scope = scope;
    this.expectedProjectId = expectedProjectId;
    const { project } = scopeState(scope, expectedProjectId);
    this.project = project;
    this.transport = transport || createHttpTransport();
  }

  execute(operation, { pathParams = {}, query = {}, options = {}, responseType = "json" } = {}) {
    const { definition } = assertScopeOperation(this.scope, this.expectedProjectId, "backlog", operation);
    const origin = providerOrigin(this.project.backlog_space_url, "backlog_space_url");
    const apiKey = this.project.backlog_api_key || "";
    if (!apiKey) throw new AppError({ code: "BACKLOG_CREDENTIAL_REQUIRED", message: "Backlog API key is not configured.", status: 422 });
    const pathname = definition.path(pathParams);
    const url = new URL(pathname, `${origin}/`);
    url.searchParams.set("apiKey", apiKey);
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
      else url.searchParams.set(key, value);
    }
    return this.request(url, { ...options, responseType });
  }

  async request(url, { timeoutMs = 10000, notFoundCode = "BACKLOG_API_ERROR", responseType = "json" } = {}) {
    let response;
    try {
      response = await this.transport.request({ url, timeoutMs });
    } catch (error) {
      if (error && error.code === "EXTERNAL_HTTP_TIMEOUT") {
        const timeout = new AppError({ code: "BACKLOG_REQUEST_TIMEOUT", message: "Backlog API request timed out.", status: 504 });
        timeout.retryable = true;
        throw timeout;
      }
      if (error && error.code === "EXTERNAL_HTTP_NETWORK") {
        const network = new AppError({ code: "BACKLOG_NETWORK_ERROR", message: "Backlog API network request failed.", status: 502 });
        network.retryable = true;
        network.cause = error.cause;
        throw network;
      }
      throw error;
    }

    if (!response.ok) {
      const code = response.status === 404 ? notFoundCode
        : response.status === 429 ? "BACKLOG_RATE_LIMITED"
          : response.status === 401 || response.status === 403 ? "BACKLOG_AUTH_FAILED"
            : response.status >= 500 ? "BACKLOG_SERVER_ERROR" : "BACKLOG_API_ERROR";
      const error = new AppError({
        code,
        message: `Backlog API failed with ${response.status}.`,
        status: response.status === 429 ? 429 : response.status >= 500 ? 502 : 422,
        details: { backlog_status_code: response.status },
      });
      error.statusCode = response.status;
      error.retryable = response.status === 429 || response.status >= 500;
      error.retryAfterSeconds = retryAfterSeconds(response.headers.get("retry-after"));
      throw error;
    }

    if (responseType === "buffer") {
      return { body: response.rawBody, contentType: response.headers.get("content-type") || null };
    }
    return JSON.parse(response.rawText);
  }
}

module.exports = { BacklogGateway };
