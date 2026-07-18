const { performance } = require("perf_hooks");

const { createRequestTrace, runWithTraceContext } = require("../../infrastructure/observability/traceContext");

function createRequestObservabilityMiddleware({ logger }) {
  return function requestObservability(req, res, next) {
    const context = createRequestTrace(req.get("x-correlation-id"));
    const startedAt = performance.now();
    let terminalLogged = false;

    req.correlationId = context.correlation_id;
    req.requestId = context.request_id;
    res.locals.correlationId = context.correlation_id;
    res.locals.requestId = context.request_id;
    res.setHeader("x-correlation-id", context.correlation_id);
    res.setHeader("x-request-id", context.request_id);

    res.locals.logResponse = ({ status, body, error }) => {
      if (terminalLogged) return;
      terminalLogged = true;
      const safe = logger.sanitizeBody(body);
      const fields = {
        event: "request.end",
        request_id: context.request_id,
        status,
        duration_ms: Math.round(performance.now() - startedAt),
        body: safe.body,
        ...(safe.redacted.length ? { redacted: safe.redacted } : {}),
        ...(error ? { error } : {}),
      };
      (status >= 500 ? logger.error : status >= 400 ? logger.warn : logger.info)(fields);
    };

    res.on("finish", () => {
      if (!terminalLogged) {
        terminalLogged = true;
        logger.info({
          event: "request.end",
          request_id: context.request_id,
          status: res.statusCode,
          duration_ms: Math.round(performance.now() - startedAt),
        });
      }
    });
    res.on("close", () => {
      if (!res.writableFinished && !terminalLogged) {
        terminalLogged = true;
        logger.warn({
          event: "request.aborted",
          request_id: context.request_id,
          duration_ms: Math.round(performance.now() - startedAt),
        });
      }
    });

    runWithTraceContext(context, () => {
      logger.info({
        event: "request.start",
        correlation_id: context.correlation_id,
        request_id: context.request_id,
        method: req.method,
        path: req.path,
      });
      next();
    });
  };
}

function createRequestBodyLoggingMiddleware({ logger }) {
  return function requestBodyLogging(req, _res, next) {
    const hasBody = req.body !== undefined && req.body !== null &&
      (typeof req.body !== "object" || Array.isArray(req.body) || Object.keys(req.body).length > 0);
    if (hasBody) {
      const safe = logger.sanitizeBody(req.body);
      logger.info({
        event: "request.body",
        request_id: req.requestId,
        body: safe.body,
        ...(safe.redacted.length ? { redacted: safe.redacted } : {}),
      });
    }
    next();
  };
}

module.exports = { createRequestBodyLoggingMiddleware, createRequestObservabilityMiddleware };
