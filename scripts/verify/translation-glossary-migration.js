const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate, ensureMigrationTable } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const { makeTempConfig } = require("./helpers/tempConfig");

const migrationsDir = path.resolve(__dirname, "../../src/db/migrations");

function checksum(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function normalizedChecksum(content) {
  return checksum(content.replace(/\r\n/g, "\n"));
}

function crlfChecksum(content) {
  return checksum(content.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"));
}

function prepareLegacyDatabase(name) {
  const config = makeTempConfig(name);
  ensureStorage(config.storage);
  const db = createConnection({ config });
  ensureMigrationTable(db);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith(".sql")
      && fileName !== "015_translation_glossary_tables.sql"
      && fileName !== "016_translation_glossary_term_variants.sql")
    .sort();

  for (const fileName of files) {
    const content = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
    db.transaction(() => {
      db.exec(content);
      db.prepare("INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)")
        .run(fileName, checksum(content));
    })();
  }

  db.close();
  return config;
}

function insertProject(config, input) {
  const db = createConnection({ config });
  try {
    return db.prepare(
      `INSERT INTO projects (name, source_language, target_language, translation_glossary_json, scheduled_pull_filter_json)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      input.name,
      input.source_language,
      input.target_language,
      input.translation_glossary_json,
      JSON.stringify({})
    ).lastInsertRowid;
  } finally {
    db.close();
  }
}

function applyMigrationFile(config, fileName) {
  const db = createConnection({ config });
  try {
    ensureMigrationTable(db);
    const content = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
    db.transaction(() => {
      db.exec(content);
      db.prepare("INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)")
        .run(fileName, checksum(content));
    })();
  } finally {
    db.close();
  }
}

function verifyFreshMigration() {
  const config = makeTempConfig("translation-glossary-fresh");
  ensureStorage(config.storage);
  migrate({ config });
  const db = createConnection({ config });
  try {
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('translation_glossary_concepts', 'translation_glossary_terms') ORDER BY name"
    ).all().map((row) => row.name);
    assert.deepEqual(tables, ["translation_glossary_concepts", "translation_glossary_terms"]);
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM pragma_table_info('projects') WHERE name = 'translation_glossary_json'").get().total, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM translation_glossary_concepts").get().total, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM translation_glossary_terms").get().total, 0);
    assert.ok(db.prepare("SELECT term_match_key, is_canonical FROM translation_glossary_terms LIMIT 1").columns);
  } finally {
    db.close();
  }
}

function verifyLegacyCrLfChecksumUpgrade() {
  const config = makeTempConfig("translation-glossary-legacy-crlf-checksum");
  ensureStorage(config.storage);
  migrate({ config });

  const fileName = "015_translation_glossary_tables.sql";
  const content = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
  const legacyHash = crlfChecksum(content);
  const canonicalHash = normalizedChecksum(content);
  assert.notEqual(legacyHash, canonicalHash);

  const before = createConnection({ config });
  before.prepare("UPDATE schema_migrations SET checksum = ? WHERE filename = ?")
    .run(legacyHash, fileName);
  before.close();

  migrate({ config });

  const after = createConnection({ config });
  try {
    assert.equal(
      after.prepare("SELECT checksum FROM schema_migrations WHERE filename = ?").get(fileName).checksum,
      canonicalHash
    );
  } finally {
    after.close();
  }
}

function verifyUpgradeBackfill() {
  const config = prepareLegacyDatabase("translation-glossary-upgrade");
  insertProject(config, {
    name: "Legacy Glossary Project",
    source_language: " JA ",
    target_language: " VI ",
    translation_glossary_json: JSON.stringify([
      { source: "予約", target: "đặt chỗ", notes: "booking" },
      { source: "管理画面", target: "màn hình quản trị" },
    ]),
  });
  migrate({ config });

  const db = createConnection({ config });
  try {
    const project = db.prepare("SELECT * FROM projects WHERE name = ?").get("Legacy Glossary Project");
    assert.equal(project.source_language, "ja");
    assert.equal(project.target_language, "vi");
    assert.equal(Object.prototype.hasOwnProperty.call(project, "translation_glossary_json"), false);
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM translation_glossary_concepts WHERE project_id = ?").get(project.id).total, 2);
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM translation_glossary_terms WHERE glossary_concept_id IN (SELECT id FROM translation_glossary_concepts WHERE project_id = ?)").get(project.id).total, 4);
    const note = db.prepare("SELECT note FROM translation_glossary_concepts WHERE project_id = ? AND concept_key = ?").get(project.id, `legacy-${project.id}-0`);
    assert.equal(note.note, "booking");
    const languages = db.prepare("SELECT DISTINCT language_code FROM translation_glossary_terms ORDER BY language_code").all().map((row) => row.language_code);
    assert.deepEqual(languages, ["ja", "vi"]);
    const migratedTerm = db.prepare("SELECT term, term_match_key, is_canonical FROM translation_glossary_terms ORDER BY id LIMIT 1").get();
    assert.equal(migratedTerm.term_match_key, migratedTerm.term.trim().toLowerCase());
    assert.equal(migratedTerm.is_canonical, 1);
  } finally {
    db.close();
  }
}

function verifyAtomicFailure(input, expectedMessage) {
  const config = prepareLegacyDatabase(`translation-glossary-failure-${expectedMessage}`);
  insertProject(config, input);
  assert.throws(() => migrate({ config }), new RegExp(expectedMessage));

  const db = createConnection({ config });
  try {
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'table' AND name = 'translation_glossary_concepts'").get().total, 0);
    const project = db.prepare("SELECT source_language, translation_glossary_json FROM projects WHERE name = ?").get(input.name);
    assert.equal(project.source_language, input.source_language);
    assert.equal(project.translation_glossary_json, input.translation_glossary_json);
  } finally {
    db.close();
  }
}

function verifyNormalizedCollisionRollback() {
  const config = prepareLegacyDatabase("translation-glossary-normalized-collision");
  insertProject(config, {
    name: "Normalized Collision Project",
    source_language: "ja",
    target_language: "vi",
    translation_glossary_json: JSON.stringify([]),
  });
  applyMigrationFile(config, "015_translation_glossary_tables.sql");

  const db = createConnection({ config });
  try {
    const project = db.prepare("SELECT id FROM projects WHERE name = ?").get("Normalized Collision Project");
    const first = db.prepare("INSERT INTO translation_glossary_concepts (project_id, group_key, concept_key) VALUES (?, 'default', 'first')").run(project.id).lastInsertRowid;
    const second = db.prepare("INSERT INTO translation_glossary_concepts (project_id, group_key, concept_key) VALUES (?, 'default', 'second')").run(project.id).lastInsertRowid;
    const insertTerm = db.prepare("INSERT INTO translation_glossary_terms (glossary_concept_id, language_code, term) VALUES (?, 'ja', ?)");
    insertTerm.run(first, " 予約 ");
    insertTerm.run(second, "予約");
  } finally {
    db.close();
  }

  const before = createConnection({ config });
  const beforeSchema = before.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'translation_glossary_terms'").get().sql;
  const beforeCount = before.prepare("SELECT COUNT(*) AS total FROM translation_glossary_terms").get().total;
  const beforeLedger = before.prepare("SELECT COUNT(*) AS total FROM schema_migrations").get().total;
  before.close();

  assert.throws(() => applyMigrationFile(config, "016_translation_glossary_term_variants.sql"), /NOT NULL/);

  const after = createConnection({ config });
  try {
    assert.equal(after.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'translation_glossary_terms'").get().sql, beforeSchema);
    assert.equal(after.prepare("SELECT COUNT(*) AS total FROM translation_glossary_terms").get().total, beforeCount);
    assert.equal(after.prepare("SELECT COUNT(*) AS total FROM schema_migrations").get().total, beforeLedger);
    assert.equal(after.prepare("SELECT COUNT(*) AS total FROM schema_migrations WHERE filename = '016_translation_glossary_term_variants.sql'").get().total, 0);
  } finally {
    after.close();
  }
}

function main() {
  verifyFreshMigration();
  verifyLegacyCrLfChecksumUpgrade();
  verifyUpgradeBackfill();
  verifyAtomicFailure({
    name: "Malformed Glossary Project",
    source_language: " JA ",
    target_language: " VI ",
    translation_glossary_json: "{bad-json",
  }, "NOT NULL");
  verifyNormalizedCollisionRollback();
  verifyAtomicFailure({
    name: "Ambiguous Glossary Project",
    source_language: "ja",
    target_language: "ja",
    translation_glossary_json: JSON.stringify([{ source: "予約", target: "đặt chỗ" }]),
  }, "NOT NULL");
  console.log("Translation glossary migration verification passed.");
}

main();
