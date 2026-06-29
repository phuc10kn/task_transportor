const Database = require("better-sqlite3");

const { loadConfig } = require("../../config/env");
const { ensureStorage } = require("../storage/bootstrap");

function createConnection(options = {}) {
  const config = options.config || loadConfig();

  ensureStorage(config.storage);

  const db = new Database(config.database.path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return db;
}

module.exports = {
  createConnection,
};
