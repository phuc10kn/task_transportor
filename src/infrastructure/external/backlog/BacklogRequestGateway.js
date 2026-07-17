const https = require("https");

const { AppError } = require("../../../http/errors/AppError");
const { assertScopeOperation, scopeState } = require("../createExternalAccessScope");
const { providerOrigin } = require("../policy");

function retryAfterSeconds(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

class BacklogRequestGateway {
  constructor({ scope, expectedProjectId }) {
    this.scope = scope;
    this.expectedProjectId = expectedProjectId;
    const { project } = scopeState(scope, expectedProjectId);
    this.project = project;
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

  request(url, { timeoutMs = 10000, notFoundCode = "BACKLOG_API_ERROR", responseType = "json" } = {}) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            const code = res.statusCode === 404 ? notFoundCode
              : res.statusCode === 429 ? "BACKLOG_RATE_LIMITED"
                : res.statusCode === 401 || res.statusCode === 403 ? "BACKLOG_AUTH_FAILED"
                  : res.statusCode >= 500 ? "BACKLOG_SERVER_ERROR" : "BACKLOG_API_ERROR";
            const error = new AppError({
              code,
              message: `Backlog API failed with ${res.statusCode}.`,
              status: res.statusCode === 429 ? 429 : res.statusCode >= 500 ? 502 : 422,
              details: { backlog_status_code: res.statusCode },
            });
            error.statusCode = res.statusCode;
            error.retryable = res.statusCode === 429 || res.statusCode >= 500;
            error.retryAfterSeconds = retryAfterSeconds(res.headers["retry-after"]);
            reject(error);
            return;
          }
          const body = Buffer.concat(chunks);
          if (responseType === "buffer") {
            resolve({ body, contentType: res.headers["content-type"] || null });
            return;
          }
          try {
            resolve(JSON.parse(body.toString("utf8")));
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
}

module.exports = { BacklogRequestGateway };
