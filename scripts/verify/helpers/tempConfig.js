const fs = require("fs");
const os = require("os");
const path = require("path");

const { loadConfig } = require("../../../src/config/env");

function makeTempEnv(name, overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `task-transportor-${name}-`));

  return {
    NODE_ENV: "test",
    PORT: "0",
    DATABASE_PATH: path.join(root, "storage", "db", "cis.sqlite"),
    STORAGE_ROOT: path.join(root, "storage"),
    ATTACHMENT_STORAGE_PATH: path.join(root, "storage", "attachments"),
    BACKUP_STORAGE_PATH: path.join(root, "storage", "backups"),
    LOG_STORAGE_PATH: path.join(root, "storage", "logs"),
    JWT_SECRET: `${name}-test-secret`,
    ...overrides,
  };
}

function makeTempConfig(name, overrides = {}) {
  return loadConfig(makeTempEnv(name, overrides));
}

module.exports = {
  makeTempConfig,
  makeTempEnv,
};
