"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { renderDocument } = require("./views/layout");
const { getLogger } = require("../../src/infrastructure/observability/logger");
const { createId, correlationIdFrom, withTraceContext } = require("../../src/infrastructure/observability/traceContext");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const TABLER = path.join(ROOT, "node_modules", "@tabler", "core", "dist");
const PROJECT_ROOT = path.resolve(ROOT, "../..");
const proxyLogConfig = {
  storage: { logs: path.resolve(PROJECT_ROOT, process.env.LOG_STORAGE_PATH || "storage/logs") },
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "test" ? "silent" : "info"),
    retentionDays: Number(process.env.LOG_RETENTION_DAYS || 7),
    stdoutEnabled: ["1", "true", "yes", "on"].includes(String(process.env.LOG_STDOUT_ENABLED || "").toLowerCase()),
  },
};
const proxyLogger = getLogger(proxyLogConfig, { service: "admin-web" });

const routes = [
  { match: /^\/login\/?$/, page: "login", title: "Sign in", script: "auth.js" },
  { match: /^\/projects\/?$/, page: "projects", title: "Project Config", script: "projects.js" },
  { match: /^\/project\/[1-9]\d*\/dashboard\/?$/, page: "dashboard", title: "Dashboard", script: "operations.js" },
  { match: /^\/project\/[1-9]\d*\/mappings\/?$/, page: "mappings", title: "Mappings", script: "mappings.js" },
  { match: /^\/project\/[1-9]\d*\/backlog-issues\/?$/, page: "backlog", title: "Backlog Issues", script: "backlog.js" },
  { match: /^\/project\/[1-9]\d*\/cis-issues\/?$/, page: "issues", title: "CIS Issues", script: "issues.js" },
  { match: /^\/project\/[1-9]\d*\/cis-issues\/[^/]+\/?$/, page: "issue-editor", title: "Issue Editor", script: "issues.js" },
  { match: /^\/project\/[1-9]\d*\/translation-queue\/?$/, page: "translation-queue", title: "Translation Queue", script: "translation.js" },
  { match: /^\/project\/[1-9]\d*\/translation-glossary\/?$/, page: "translation-glossary", title: "Translation Glossary", script: "translation.js" },
  { match: /^\/project\/[1-9]\d*\/anomalies\/?$/, page: "anomalies", title: "Anomalies", script: "operations.js" },
  { match: /^\/project\/[1-9]\d*\/sync-jobs\/?$/, page: "sync-jobs", title: "Sync Jobs", script: "operations.js" },
  { match: /^\/project\/[1-9]\d*\/journal\/?$/, page: "journal", title: "Journal", script: "operations.js" },
];

const assets = new Map([
  ["/favicon.ico", path.join(PUBLIC, "favicon.svg")],
  ["/assets/favicon.svg", path.join(PUBLIC, "favicon.svg")],
  ["/assets/app.css", path.join(PUBLIC, "app.css")],
  ["/assets/shared.js", path.join(PUBLIC, "shared.js")],
  ["/assets/pages/auth.js", path.join(PUBLIC, "pages", "auth.js")],
  ["/assets/pages/projects.js", path.join(PUBLIC, "pages", "projects.js")],
  ["/assets/pages/backlog.js", path.join(PUBLIC, "pages", "backlog.js")],
  ["/assets/pages/mappings.js", path.join(PUBLIC, "pages", "mappings.js")],
  ["/assets/pages/issues.js", path.join(PUBLIC, "pages", "issues.js")],
  ["/assets/pages/translation.js", path.join(PUBLIC, "pages", "translation.js")],
  ["/assets/pages/operations.js", path.join(PUBLIC, "pages", "operations.js")],
  ["/vendor/tabler/tabler.min.css", path.join(TABLER, "css", "tabler.min.css")],
  ["/vendor/tabler/tabler.min.js", path.join(TABLER, "js", "tabler.min.js")],
  ["/vendor/markdown-it/markdown-it.min.js", path.join(ROOT, "node_modules", "markdown-it", "dist", "markdown-it.min.js")],
]);

function routeFor(pathname) {
  return routes.find((route) => route.match.test(pathname)) || null;
}

function contentType(file) {
  if (file.endsWith(".svg")) return "image/svg+xml; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}

function send(res, status, body, type = "text/plain; charset=utf-8", headers = {}) {
  res.writeHead(status, { "content-type": type, "content-length": Buffer.byteLength(body), ...headers });
  res.end(body);
}

async function serveAsset(res, pathname) {
  const file = assets.get(pathname);
  if (!file) return false;
  try {
    const body = await fs.promises.readFile(file);
    res.writeHead(200, {
      "content-type": contentType(file),
      "content-length": body.length,
      "cache-control": process.env.NODE_ENV === "production" && pathname.startsWith("/vendor/") ? "public, max-age=86400" : "no-cache",
    });
    res.end(body);
  } catch (error) {
    send(res, 500, `Asset unavailable: ${error.message}`);
  }
  return true;
}

function proxyBodyForLog(body) {
  if (!body) return null;
  const text = body.toString("utf8");
  try { return JSON.parse(text); } catch (_error) { return text; }
}

async function proxyApi(req, res, url, { logger = proxyLogger, fetchImpl = globalThis.fetch } = {}) {
  const origin = (process.env.CIS_API_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers["content-length"];
  const correlationId = correlationIdFrom(req.headers["x-correlation-id"]) || createId("cor");
  const traceId = createId("trc");
  headers["x-correlation-id"] = correlationId;

  return withTraceContext({ trace_id: traceId, correlation_id: correlationId }, async () => {
    const startedAt = Date.now();
    logger.info({ event: "proxy.start", request_id: correlationId, method: req.method, path: `${url.pathname}${url.search}` });
    try {
      const upstream = await fetchImpl(`${origin}${url.pathname}${url.search}`, {
        method: req.method,
        headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
        signal: AbortSignal.timeout(60000),
      });
      const responseBody = Buffer.from(await upstream.arrayBuffer());
      const responseHeaders = {};
      for (const name of ["content-type", "cache-control", "x-correlation-id"]) {
        const value = upstream.headers.get(name);
        if (value) responseHeaders[name] = value;
      }
      responseHeaders["x-correlation-id"] = responseHeaders["x-correlation-id"] || correlationId;
      responseHeaders["content-length"] = responseBody.length;
      logger.info({
        event: "proxy.end",
        request_id: correlationId,
        status: upstream.status,
        duration_ms: Date.now() - startedAt,
      });
      res.writeHead(upstream.status, responseHeaders);
      res.end(responseBody);
    } catch (error) {
      const loggedBody = logger.sanitizeBody(proxyBodyForLog(body));
      logger.error({
        event: "proxy.error",
        request_id: correlationId,
        duration_ms: Date.now() - startedAt,
        body: loggedBody.body,
        ...(loggedBody.redacted.length ? { redacted: loggedBody.redacted } : {}),
        error: { code: "API_PROXY_ERROR", message: error.message || "API proxy request failed." },
      });
      send(
        res,
        502,
        JSON.stringify({ error: { code: "API_PROXY_ERROR", message: error.message, correlation_id: correlationId } }),
        "application/json; charset=utf-8",
        { "x-correlation-id": correlationId }
      );
    }
  });
}

function createServer({ logger = proxyLogger, fetchImpl = globalThis.fetch } = {}) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://admin.local");
    if (url.pathname.startsWith("/api/v1/")) return proxyApi(req, res, url, { logger, fetchImpl });
    if (await serveAsset(res, url.pathname)) return;
    if (url.pathname === "/") {
      res.writeHead(302, { location: "/projects" });
      return res.end();
    }
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");
    const route = routeFor(url.pathname);
    if (!route) return send(res, 404, "Not found");
    const html = renderDocument(route, url.pathname);
    if (req.method === "HEAD") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end();
    }
    return send(res, 200, html, "text/html; charset=utf-8", {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      "x-content-type-options": "nosniff",
      "referrer-policy": "same-origin",
    });
  });
}

function portFrom(argv = process.argv, env = process.env) {
  const index = argv.indexOf("--port");
  const value = index >= 0 ? argv[index + 1] : env.ADMIN_WEB_PORT || env.PORT || "3001";
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`Invalid port: ${value}`);
  return port;
}

if (require.main === module) {
  const port = portFrom();
  const host = process.env.ADMIN_WEB_HOST || "127.0.0.1";
  const server = createServer();
  server.listen(port, host, () => proxyLogger.info({ event: "server.started", host, port }));
  const shutdown = () => server.close(() => { void proxyLogger.close(); });
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

module.exports = { createServer, portFrom, routeFor };
