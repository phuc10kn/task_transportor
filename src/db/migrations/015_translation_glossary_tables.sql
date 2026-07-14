CREATE TABLE translation_glossary_concepts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  group_key TEXT NOT NULL DEFAULT 'default',
  concept_key TEXT NOT NULL,
  note TEXT,
  created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, group_key, concept_key)
);

CREATE TABLE translation_glossary_terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  glossary_concept_id INTEGER NOT NULL REFERENCES translation_glossary_concepts(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  term TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(glossary_concept_id, language_code)
);

CREATE TEMP TABLE translation_glossary_migration_assert (
  value TEXT NOT NULL CHECK (value = 'ok')
);

UPDATE projects
SET source_language = lower(trim(COALESCE(source_language, ''))),
    target_language = lower(trim(COALESCE(target_language, '')));

INSERT INTO translation_glossary_migration_assert (value)
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM projects
    WHERE source_language = '' OR target_language = ''
  ) THEN NULL
  ELSE 'ok'
END;

INSERT INTO translation_glossary_migration_assert (value)
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM projects
    WHERE json_valid(COALESCE(translation_glossary_json, '')) <> 1
       OR (
         json_valid(COALESCE(translation_glossary_json, '')) = 1
         AND json_type(translation_glossary_json) <> 'array'
       )
  ) THEN NULL
  ELSE 'ok'
END;

INSERT INTO translation_glossary_migration_assert (value)
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM projects AS p
    JOIN json_each(p.translation_glossary_json) AS entry
    WHERE json_type(entry.value) <> 'object'
       OR trim(COALESCE(json_extract(entry.value, '$.source'), '')) = ''
       OR trim(COALESCE(json_extract(entry.value, '$.target'), '')) = ''
  ) THEN NULL
  ELSE 'ok'
END;

INSERT INTO translation_glossary_migration_assert (value)
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM projects AS p
    JOIN json_each(p.translation_glossary_json) AS entry
    WHERE p.source_language = p.target_language
      AND trim(COALESCE(json_extract(entry.value, '$.source'), ''))
          <> trim(COALESCE(json_extract(entry.value, '$.target'), ''))
  ) THEN NULL
  ELSE 'ok'
END;

INSERT INTO translation_glossary_concepts (
  project_id,
  group_key,
  concept_key,
  note
)
SELECT
  p.id,
  'default',
  'legacy-' || p.id || '-' || entry.key,
  NULLIF(trim(COALESCE(json_extract(entry.value, '$.notes'), '')), '')
FROM projects AS p
JOIN json_each(p.translation_glossary_json) AS entry;

INSERT INTO translation_glossary_terms (
  glossary_concept_id,
  language_code,
  term
)
SELECT
  c.id,
  p.source_language,
  trim(json_extract(entry.value, '$.source'))
FROM projects AS p
JOIN json_each(p.translation_glossary_json) AS entry
JOIN translation_glossary_concepts AS c
  ON c.project_id = p.id
 AND c.concept_key = 'legacy-' || p.id || '-' || entry.key
UNION ALL
SELECT
  c.id,
  p.target_language,
  trim(json_extract(entry.value, '$.target'))
FROM projects AS p
JOIN json_each(p.translation_glossary_json) AS entry
JOIN translation_glossary_concepts AS c
  ON c.project_id = p.id
 AND c.concept_key = 'legacy-' || p.id || '-' || entry.key
ON CONFLICT(glossary_concept_id, language_code) DO UPDATE SET
  term = excluded.term,
  updated_at = datetime('now');

DROP TABLE translation_glossary_migration_assert;

ALTER TABLE projects DROP COLUMN translation_glossary_json;
