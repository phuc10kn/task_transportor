const assert = require("assert");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const MIGRATION_016 = "016_translation_glossary_term_variants.sql";

function parseDatabasePath(argv) {
  const index = argv.indexOf("--database");
  const value = index >= 0 ? argv[index + 1] : null;
  if (!value || value === "--" || value === ":memory:") {
    throw new Error("--database must be an absolute SQLite database path.");
  }

  if (!path.isAbsolute(value)) {
    throw new Error("--database must be an absolute SQLite database path.");
  }

  const resolved = path.resolve(value);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Database file does not exist: ${resolved}`);
  }

  const normalized = resolved.toLowerCase();
  const temporaryMarkers = [
    `${path.sep}tmp${path.sep}`.toLowerCase(),
    `${path.sep}temp${path.sep}`.toLowerCase(),
    `${path.sep}fixtures${path.sep}`.toLowerCase(),
  ];
  if (temporaryMarkers.some((marker) => normalized.includes(marker))) {
    throw new Error(`Refusing temporary or fixture database path: ${resolved}`);
  }

  return resolved;
}

function normalizeTextKey(value) {
  return String(value === null || value === undefined ? "" : value)
    .trim()
    .toLowerCase();
}

function assertTable(db, tableName) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);
  assert.ok(row, `Missing required table: ${tableName}`);
}

function assertSQLiteGeneratedColumnSupport(version) {
  const parts = String(version).split(".").map((part) => Number(part));
  const supported = parts[0] > 3
    || (parts[0] === 3 && parts[1] > 31)
    || (parts[0] === 3 && parts[1] === 31 && parts[2] >= 0);
  assert.ok(supported, `SQLite ${version} does not support generated columns.`);
}

function collectPreflightEvidence(db, databasePath) {
  assertTable(db, "schema_migrations");
  assertTable(db, "translation_glossary_concepts");
  assertTable(db, "translation_glossary_terms");

  const migrationRows = db
    .prepare("SELECT filename FROM schema_migrations ORDER BY id ASC")
    .all();
  const migrations = migrationRows.map((row) => row.filename);
  assert.ok(!migrations.includes(MIGRATION_016), "Migration 016 is already applied to target database.");

  const sqliteVersion = db.prepare("SELECT sqlite_version() AS version").get().version;
  assertSQLiteGeneratedColumnSupport(sqliteVersion);

  const termColumns = db.prepare("PRAGMA table_info('translation_glossary_terms')").all().map((row) => row.name);
  assert.ok(!termColumns.includes("is_canonical"), "Target database already has the term-variant schema.");
  assert.ok(!termColumns.includes("term_match_key"), "Target database already has term_match_key.");

  const legacyJsonColumn = db
    .prepare("SELECT COUNT(*) AS total FROM pragma_table_info('projects') WHERE name = 'translation_glossary_json'")
    .get().total;
  assert.equal(legacyJsonColumn, 0, "Legacy translation_glossary_json column must already be removed.");

  const foreignKeyViolations = db.pragma("foreign_key_check");
  assert.equal(foreignKeyViolations.length, 0, "Target database has foreign-key violations.");

  const projects = db.prepare("SELECT COUNT(*) AS total FROM projects").get().total;
  const concepts = db.prepare("SELECT COUNT(*) AS total FROM translation_glossary_concepts").get().total;
  const terms = db.prepare("SELECT COUNT(*) AS total FROM translation_glossary_terms").get().total;
  const invalidTermRows = db.prepare(
    `SELECT COUNT(*) AS total
     FROM translation_glossary_terms
     WHERE id IS NULL
        OR glossary_concept_id IS NULL
        OR language_code IS NULL
        OR trim(language_code) = ''
        OR term IS NULL
        OR trim(term) = ''
        OR created_at IS NULL
        OR updated_at IS NULL`
  ).get().total;

  // The target connection is read-only, so use the same JS normalization in memory
  // instead of registering a write-capable function or changing database pragmas.
  const rows = db.prepare(
    `SELECT c.project_id, c.id AS concept_id, t.language_code, t.term
     FROM translation_glossary_concepts AS c
     JOIN translation_glossary_terms AS t
       ON t.glossary_concept_id = c.id
     ORDER BY c.project_id ASC, t.language_code ASC, c.id ASC, t.id ASC`
  ).all();

  const collisionGroups = new Map();
  const baselineGroups = new Map();
  let normalizedBlankTerms = 0;
  for (const row of rows) {
    const normalizedLanguage = String(row.language_code || "").trim().toLowerCase();
    const termKey = normalizeTextKey(row.term);
    if (!termKey) {
      normalizedBlankTerms += 1;
    }
    const collisionKey = `${row.project_id}\u0000${normalizedLanguage}\u0000${termKey}`;
    if (!collisionGroups.has(collisionKey)) {
      collisionGroups.set(collisionKey, new Set());
    }
    collisionGroups.get(collisionKey).add(row.concept_id);

    const baselineKey = `${row.concept_id}\u0000${normalizedLanguage}`;
    baselineGroups.set(baselineKey, (baselineGroups.get(baselineKey) || 0) + 1);
  }

  const collisions = Array.from(collisionGroups.entries())
    .filter(([, conceptIds]) => conceptIds.size > 1)
    .map(([key, conceptIds]) => ({ key, concept_ids: Array.from(conceptIds).sort((a, b) => a - b) }));
  assert.equal(invalidTermRows + normalizedBlankTerms, 0, "Target database has blank or incomplete glossary term rows.");
  assert.equal(collisions.length, 0, "Target database has normalized cross-concept term collisions.");

  const multiTermLanguageGroups = Array.from(baselineGroups.values()).filter((count) => count > 1);
  assert.equal(multiTermLanguageGroups.length, 0, "Target baseline has more than one term per concept/language.");

  return {
    database_path: databasePath,
    sqlite_version: sqliteVersion,
    applied_migrations: migrations,
    projects,
    concepts,
    terms,
    foreign_key_violations: foreignKeyViolations.length,
    normalized_collisions: collisions.length,
    baseline_language_groups: baselineGroups.size,
  };
}

function main(argv = process.argv.slice(2)) {
  const databasePath = parseDatabasePath(argv);
  const db = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    const evidence = collectPreflightEvidence(db, databasePath);
    console.log(JSON.stringify(evidence, null, 2));
    console.log("Translation glossary preflight passed (read-only).");
  } finally {
    db.close();
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
  normalizeTextKey,
  parseDatabasePath,
};
