const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const ROOT_DIR = path.resolve(__dirname, "../..");

function numberFromEnv(value, fallback) {
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric env value: ${value}`);
  }

  return parsed;
}

function boolFromEnv(value, fallback = false) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function resolveFromRoot(value, fallback) {
  const rawPath = value || fallback;

  if (path.isAbsolute(rawPath)) {
    return rawPath;
  }

  return path.join(ROOT_DIR, rawPath);
}

function requireProductionEnv(env, names) {
  if (env.NODE_ENV !== "production") {
    return;
  }

  const missing = names.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required production env: ${missing.join(", ")}`);
  }
}

function loadConfig(env = process.env) {
  requireProductionEnv(env, [
    "NODE_ENV",
    "DATABASE_PATH",
    "STORAGE_ROOT",
    "ATTACHMENT_STORAGE_PATH",
    "JWT_SECRET",
  ]);

  const databasePath = resolveFromRoot(env.DATABASE_PATH, "storage/db/cis.sqlite");
  const storageRoot = resolveFromRoot(env.STORAGE_ROOT, "storage");
  const attachmentPath = resolveFromRoot(env.ATTACHMENT_STORAGE_PATH, "storage/attachments");

  return {
    env: env.NODE_ENV || "development",
    isProduction: env.NODE_ENV === "production",
    port: numberFromEnv(env.PORT, 3000),
    rootDir: ROOT_DIR,
    database: {
      path: databasePath,
    },
    storage: {
      root: storageRoot,
      databaseDir: path.dirname(databasePath),
      attachments: attachmentPath,
      backups: resolveFromRoot(env.BACKUP_STORAGE_PATH, "storage/backups"),
      logs: resolveFromRoot(env.LOG_STORAGE_PATH, "storage/logs"),
    },
    security: {
      jwtSecret: env.JWT_SECRET || "local-development-jwt-secret",
    },
    http: {
      jsonLimit: env.HTTP_JSON_LIMIT || "1mb",
    },
    worker: {
      enabled: boolFromEnv(env.WORKER_ENABLED, false),
      id: env.WORKER_ID || "local-worker",
      pollIntervalMs: numberFromEnv(env.WORKER_POLL_INTERVAL_MS, 5000),
      lockTimeoutSeconds: numberFromEnv(env.WORKER_LOCK_TIMEOUT_SECONDS, 300),
    },
  };
}

module.exports = {
  ROOT_DIR,
  loadConfig,
};
