const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ quiet: true });

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
      jwtExpiresInSeconds: numberFromEnv(env.JWT_EXPIRES_IN_SECONDS, 7 * 24 * 60 * 60),
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
    backlog: {
      fakeFixturePath: env.BACKLOG_FAKE_FIXTURE_PATH || "",
    },
    jira: {
      fakeMode: env.JIRA_FAKE_MODE || "",
      fakeSeedPath: env.JIRA_FAKE_SEED_PATH ? resolveFromRoot(env.JIRA_FAKE_SEED_PATH) : "",
      fakeStatePath: env.JIRA_FAKE_STATE_PATH ? resolveFromRoot(env.JIRA_FAKE_STATE_PATH) : "",
      requestTimeoutSeconds: numberFromEnv(env.JIRA_REQUEST_TIMEOUT_SECONDS, 30),
    },
    translation: {
      codexExecCommand: env.CODEX_EXEC_COMMAND || "",
      codexExecTimeoutSeconds: numberFromEnv(env.CODEX_EXEC_TIMEOUT_SECONDS, 60),
      codexExecWorkdir: env.CODEX_EXEC_WORKDIR
        ? resolveFromRoot(env.CODEX_EXEC_WORKDIR)
        : ROOT_DIR,
      deepSeekApiKey: env.DEEPSEEK_API_KEY || "",
      deepSeekOpenAiBaseUrl: env.DEEPSEEK_OPENAI_BASE_URL || env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      deepSeekAnthropicBaseUrl: env.DEEPSEEK_ANTHROPIC_BASE_URL || "https://api.deepseek.com/anthropic",
      deepSeekBaseUrl: env.DEEPSEEK_OPENAI_BASE_URL || env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      deepSeekRequestTimeoutSeconds: numberFromEnv(env.DEEPSEEK_REQUEST_TIMEOUT_SECONDS, 60),
      openAiApiKey: env.OPENAI_API_KEY || "",
      openAiBaseUrl: env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      openAiRequestTimeoutSeconds: numberFromEnv(env.OPENAI_REQUEST_TIMEOUT_SECONDS, 60),
      lowConfidenceThreshold: numberFromEnv(env.TRANSLATION_LOW_CONFIDENCE_THRESHOLD, 0.7),
    },
  };
}

module.exports = {
  ROOT_DIR,
  loadConfig,
};
