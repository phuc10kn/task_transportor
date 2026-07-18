const fs = require("fs");
const path = require("path");
const pino = require("pino");

const { currentTraceContext } = require("./traceContext");

const PROVIDERS = new Set(["backlog", "jira", "deepseek", "openai"]);
const LEVELS = new Set(["trace", "debug", "info", "warn", "error", "fatal", "silent"]);
const SENSITIVE_KEYS = new Set([
  "authorization", "proxyauthorization", "cookie", "setcookie", "password", "passwd",
  "secret", "token", "apikey", "apitoken", "accesstoken", "refreshtoken", "jwttoken",
  "jiraapitoken", "backlogapikey", "openaikey", "deepseekapikey",
  "credential", "initialpassword", "passwordhash",
]);
const cache = new WeakMap();

function normalizedKey(key) {
  return String(key || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function scrubText(value) {
  return String(value)
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]")
    .replace(/([?&](?:apiKey|api_key|token|access_token)=)[^&\s]+/gi, "$1[REDACTED]");
}

function sanitize(value, currentPath = "$", redacted = [], seen = new WeakSet()) {
  if (value === null || value === undefined || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") return scrubText(value);
  if (typeof value === "bigint") return value.toString();
  if (Buffer.isBuffer(value)) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return String(value);
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item, index) => sanitize(item, `${currentPath}[${index}]`, redacted, seen));
  }

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    const itemPath = `${currentPath}.${key}`;
    if (SENSITIVE_KEYS.has(normalizedKey(key))) {
      output[key] = "[REDACTED]";
      redacted.push(itemPath);
    } else {
      output[key] = sanitize(item, itemPath, redacted, seen);
    }
  }
  return output;
}

function sanitizeBody(body) {
  const redacted = [];
  return { body: sanitize(body, "$", redacted), redacted };
}

function dateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function cleanupOldLogs(root, retentionDays) {
  if (!Number.isFinite(retentionDays) || retentionDays < 1) return;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const directories = [
    path.join(root, "app"),
    ...Array.from(PROVIDERS, (provider) => path.join(root, "external", provider)),
  ];
  for (const directory of directories) {
    try {
      if (!fs.existsSync(directory)) continue;
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (!entry.isFile() || !/^[a-z0-9-]+-\d{4}-\d{2}-\d{2}\.ndjson$/i.test(entry.name)) continue;
        const filePath = path.join(directory, entry.name);
        if (fs.statSync(filePath).mtimeMs < cutoff) fs.unlinkSync(filePath);
      }
    } catch (_error) {}
  }
}

function createLogManager(config, { service = "cis-api" } = {}) {
  const level = LEVELS.has(config.logging && config.logging.level) ? config.logging.level : "info";
  const root = config.storage.logs;
  const retentionDays = Number(config.logging && config.logging.retentionDays || 7);
  const stdoutEnabled = Boolean(config.logging && config.logging.stdoutEnabled);
  const channels = new Map();
  let cleaned = false;

  function fileFor(channel, day) {
    if (channel === "app") return path.join(root, "app", `${service}-${day}.ndjson`);
    if (!PROVIDERS.has(channel)) throw new Error(`Unsupported log provider: ${channel}`);
    return path.join(root, "external", channel, `${channel}-${day}.ndjson`);
  }

  function closeChannel(state) {
    if (!state) return Promise.resolve();
    try { state.logger.flush(); } catch (_error) {}
    return Promise.all(state.destinations.map((destination) => new Promise((resolve) => {
      try { destination.flushSync(); } catch (_error) {}
      if (destination.destroyed) return resolve();
      destination.once("close", resolve);
      try { destination.end(); } catch (_error) { resolve(); }
    })));
  }

  function loggerFor(channel) {
    if (level === "silent") return null;
    if (!cleaned) {
      fs.mkdirSync(root, { recursive: true });
      cleanupOldLogs(root, retentionDays);
      cleaned = true;
    }
    const day = dateKey();
    const current = channels.get(channel);
    if (current && current.day === day) return current.logger;
    if (current) void closeChannel(current);

    const filePath = fileFor(channel, day);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const fileDestination = pino.destination({ dest: filePath, mkdir: true, sync: false });
    const destinations = [fileDestination];
    const stream = stdoutEnabled && channel === "app"
      ? pino.multistream([{ stream: fileDestination }, { stream: pino.destination(1) }])
      : fileDestination;
    const instance = pino({ level, base: null, timestamp: pino.stdTimeFunctions.epochTime }, stream);
    channels.set(channel, { day, logger: instance, destinations });
    return instance;
  }

  function write(channel, logLevel, fields) {
    try {
      const instance = loggerFor(channel);
      if (!instance || typeof instance[logLevel] !== "function") return;
      const trace = currentTraceContext();
      const record = {
        v: 1,
        ...(trace.trace_id ? { trace_id: trace.trace_id } : {}),
        ...sanitize(fields),
      };
      instance[logLevel](record);
    } catch (error) {
      try { process.stderr.write(`Logging failed: ${error.message}\n`); } catch (_ignored) {}
    }
  }

  return {
    debug(fields) { write("app", "debug", fields); },
    info(fields) { write("app", "info", fields); },
    warn(fields) { write("app", "warn", fields); },
    error(fields) { write("app", "error", fields); },
    external(provider, logLevel, fields) { write(provider, logLevel, fields); },
    sanitizeBody,
    flush() {
      for (const state of channels.values()) {
        try { state.logger.flush(); } catch (_error) {}
        for (const destination of state.destinations) {
          try { destination.flushSync(); } catch (_error) {}
        }
      }
    },
    async close() {
      const closing = Array.from(channels.values(), closeChannel);
      channels.clear();
      await Promise.all(closing);
    },
  };
}

function getLogger(config, options = {}) {
  let byService = cache.get(config);
  if (!byService) {
    byService = new Map();
    cache.set(config, byService);
  }
  const service = options.service || "cis-api";
  if (!byService.has(service)) byService.set(service, createLogManager(config, { service }));
  return byService.get(service);
}

module.exports = { getLogger, sanitizeBody };
