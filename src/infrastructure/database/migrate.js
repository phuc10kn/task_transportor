const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { loadConfig } = require("../../config/env");
const { createConnection } = require("./connection");

const MIGRATIONS_DIR = path.resolve(__dirname, "../../db/migrations");

function ensureMigrationTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();
}

function checksum(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function applyMigration(db, fileName) {
  const filePath = path.join(MIGRATIONS_DIR, fileName);
  const sql = fs.readFileSync(filePath, "utf8");
  const hash = checksum(sql);
  const existing = db
    .prepare("SELECT filename, checksum FROM schema_migrations WHERE filename = ?")
    .get(fileName);

  if (existing) {
    if (existing.checksum !== hash) {
      throw new Error(`Migration checksum changed: ${fileName}`);
    }

    return false;
  }

  const run = db.transaction(() => {
    db.exec(sql);
    db
      .prepare("INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)")
      .run(fileName, hash);
  });

  run();
  return true;
}

function migrate(options = {}) {
  const config = options.config || loadConfig();
  const db = options.db || createConnection({ config });
  const shouldClose = !options.db;

  try {
    ensureMigrationTable(db);

    const applied = [];
    for (const fileName of getMigrationFiles()) {
      if (applyMigration(db, fileName)) {
        applied.push(fileName);
      }
    }

    return {
      applied,
      databasePath: config.database.path,
    };
  } finally {
    if (shouldClose) {
      db.close();
    }
  }
}

if (require.main === module) {
  const result = migrate();
  console.log(`Migrations complete. Applied: ${result.applied.length}`);
}

module.exports = {
  MIGRATIONS_DIR,
  ensureMigrationTable,
  migrate,
};
