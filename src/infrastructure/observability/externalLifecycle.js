const { performance } = require("perf_hooks");

const { getLogger } = require("./logger");
const { createId, currentTraceContext } = require("./traceContext");

function startExternalRequest({ config, provider, operation, method, url, body }) {
  const logger = getLogger(config);
  const externalRequestId = createId("ext");
  const startedAt = performance.now();
  const context = currentTraceContext();
  const requestBody = logger.sanitizeBody(body);
  logger.external(provider, "info", {
    event: "request",
    ...(context.job_id ? { job_id: context.job_id } : {}),
    ...(context.request_id ? { request_id: context.request_id } : {}),
    external_request_id: externalRequestId,
    operation,
    ...(method ? { method } : {}),
    ...(url ? { url: String(url) } : {}),
    body: requestBody.body,
    ...(requestBody.redacted.length ? { redacted: requestBody.redacted } : {}),
  });

  return {
    id: externalRequestId,
    response({ status, body: responseBody, providerRequestId, binaryOmitted = false }) {
      const safe = logger.sanitizeBody(responseBody);
      logger.external(provider, status >= 500 ? "error" : status >= 400 ? "warn" : "info", {
        event: "response",
        external_request_id: externalRequestId,
        operation,
        status,
        duration_ms: Math.round(performance.now() - startedAt),
        ...(providerRequestId ? { provider_request_id: providerRequestId } : {}),
        body: safe.body,
        ...(binaryOmitted ? { binary_omitted: true } : {}),
        ...(safe.redacted.length ? { redacted: safe.redacted } : {}),
      });
    },
    error(error) {
      logger.external(provider, "error", {
        event: "error",
        external_request_id: externalRequestId,
        operation,
        duration_ms: Math.round(performance.now() - startedAt),
        error: {
          code: error && error.code || "EXTERNAL_REQUEST_FAILED",
          message: error && error.message || "External request failed.",
          retryable: Boolean(error && error.retryable),
        },
      });
    },
  };
}

module.exports = { startExternalRequest };
