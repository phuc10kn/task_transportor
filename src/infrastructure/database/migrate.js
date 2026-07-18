const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { loadConfig } = require("../../config/env");
const { createConnection } = require("./connection");

const MIGRATIONS_DIR = path.resolve(__dirname, "../../db/migrations");
const LEGACY_MIGRATION_CHECKSUMS = Object.freeze({
  "001_auth_projects.sql": new Set([
    "56024bbebb08a2fa38298335c5860a8e53834cae38b769bbb98a50a12bd22e29",
    "c79b1d11d5a6eead82864174b2ab813e6df397da022ce1494df0da59ac7a4fc2",
  ]),
  "002_cis_jobs.sql": new Set([
    "2da497b27f35ac3bfbb82c73355149779f532090e67b7e9b9c5ff9a531ff95d1",
    "56791d381301575927501c8e21aba55ab5fa5a253cb198722b226f06014e19b9",
  ]),
  "011_deepseek_translation_defaults.sql": new Set([
    "5ad6061d9bcc55997e32c4331e90adf1a02465a96425de16ded30786aba5997a",
    "1facc6218d4f903496b1f9c9fe43a075696091e632a7dcf8621413cb3b802f6e",
  ]),
  "013_translation_ai_config.sql": new Set([
    "a672ac7247de84284fa4362f5518418d41240ed784a9022b4746878898ee8a9f",
    "810b666948d92257793b5e3a306e1e601ba4054c08a12bf2c1019779441967c5",
  ]),
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
