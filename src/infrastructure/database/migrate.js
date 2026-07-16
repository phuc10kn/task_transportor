const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { loadConfig } = require("../../config/env");
const { createConnection } = require("./connection");

const MIGRATIONS_DIR = path.resolve(__dirname, "../../db/migrations");
const LEGACY_MIGRATION_CHECKSUMS = Object.freeze({
  "017_sync_translate_jira_job.sql": new Set([
    "90596e625a4e67df50d5b809fa38b78e6c20195b8550bd3806e618aa9075107f",
  ]),
});

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

function hash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function migrationChecksums(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  return {
    canonical: hash(normalized),
    compatible: new Set([
      hash(content),
      hash(normalized),
      hash(normalized.replace(/\n/g, "\r\n")),
    ]),
  };
}

function applyMigration(db, fileName) {
  const filePath = path.join(MIGRATIONS_DIR, fileName);
  const content = fs.readFileSync(filePath, "utf8");
  const hashes = migrationChecksums(content);
  const existing = db
    .prepare("SELECT filename, checksum FROM schema_migrations WHERE filename = ?")
    .get(fileName);

  if (existing) {
    const legacyChecksums = LEGACY_MIGRATION_CHECKSUMS[fileName];
    if (!hashes.compatible.has(existing.checksum) && !legacyChecksums?.has(existing.checksum)) {
      throw new Error(`Migration checksum changed: ${fileName}`);
    }

    if (existing.checksum !== hashes.canonical) {
      db.prepare("UPDATE schema_migrations SET checksum = ? WHERE filename = ?")
        .run(hashes.canonical, fileName);
    }

    return false;
  }

  const run = db.transaction(() => {
    db.exec(content);
    db
      .prepare("INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)")
      .run(fileName, hashes.canonical);
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
