const Database = require("better-sqlite3");

const { loadConfig } = require("../../config/env");
const { ensureStorage } = require("../storage/bootstrap");

function createConnection(options = {}) {
  const config = options.config || loadConfig();

  ensureStorage(config.storage);

  const db = new Database(config.database.path);
  db.function("normalize_text_key", { deterministic: true }, (value) =>
    String(value === null || value === undefined ? "" : value).trim().toLowerCase()
  );
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return db;
}

module.exports = {
  createConnection,
};
