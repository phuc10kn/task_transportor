CREATE TEMP TABLE translation_glossary_variant_migration_assert (
  value TEXT NOT NULL CHECK (value = 'ok')
);

INSERT INTO translation_glossary_variant_migration_assert (value)
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM translation_glossary_terms AS t
    WHERE trim(t.term) = ''
  ) THEN NULL
  ELSE 'ok'
END;

INSERT INTO translation_glossary_variant_migration_assert (value)
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM translation_glossary_concepts AS c
    JOIN translation_glossary_terms AS t
      ON t.glossary_concept_id = c.id
    GROUP BY c.project_id, t.language_code, normalize_text_key(t.term)
    HAVING COUNT(DISTINCT c.id) > 1
  ) THEN NULL
  ELSE 'ok'
END;

CREATE TABLE translation_glossary_terms_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  glossary_concept_id INTEGER NOT NULL REFERENCES translation_glossary_concepts(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  term TEXT NOT NULL,
  term_match_key TEXT GENERATED ALWAYS AS (normalize_text_key(term)) STORED,
  is_canonical INTEGER NOT NULL DEFAULT 1 CHECK (is_canonical IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(glossary_concept_id, language_code, term_match_key),
  CHECK (length(term_match_key) > 0)
);

INSERT INTO translation_glossary_terms_new (
  id, glossary_concept_id, language_code, term, is_canonical, created_at, updated_at
)
SELECT id, glossary_concept_id, language_code, term, 1, created_at, updated_at
FROM translation_glossary_terms;

DROP TABLE translation_glossary_terms;
ALTER TABLE translation_glossary_terms_new RENAME TO translation_glossary_terms;

CREATE UNIQUE INDEX translation_glossary_terms_one_canonical_per_language
  ON translation_glossary_terms (glossary_concept_id, language_code)
  WHERE is_canonical = 1;

CREATE TRIGGER translation_glossary_term_insert_project_conflict
BEFORE INSERT ON translation_glossary_terms
WHEN EXISTS (
  SELECT 1
  FROM translation_glossary_terms AS existing_term
  JOIN translation_glossary_concepts AS existing_concept
    ON existing_concept.id = existing_term.glossary_concept_id
  JOIN translation_glossary_concepts AS new_concept
    ON new_concept.id = NEW.glossary_concept_id
  WHERE existing_concept.project_id = new_concept.project_id
    AND existing_term.language_code = NEW.language_code
    AND existing_term.term_match_key = NEW.term_match_key
    AND existing_term.glossary_concept_id <> NEW.glossary_concept_id
)
BEGIN
  SELECT RAISE(ABORT, 'TRANSLATION_GLOSSARY_TERM_CONFLICT');
END;

CREATE TRIGGER translation_glossary_term_update_project_conflict
BEFORE UPDATE OF glossary_concept_id, language_code, term ON translation_glossary_terms
WHEN EXISTS (
  SELECT 1
  FROM translation_glossary_terms AS existing_term
  JOIN translation_glossary_concepts AS existing_concept
    ON existing_concept.id = existing_term.glossary_concept_id
  JOIN translation_glossary_concepts AS new_concept
    ON new_concept.id = NEW.glossary_concept_id
  WHERE existing_concept.project_id = new_concept.project_id
    AND existing_term.language_code = NEW.language_code
    AND existing_term.term_match_key = NEW.term_match_key
    AND existing_term.id <> OLD.id
)
BEGIN
  SELECT RAISE(ABORT, 'TRANSLATION_GLOSSARY_TERM_CONFLICT');
END;

CREATE TRIGGER translation_glossary_concept_project_immutable
BEFORE UPDATE OF project_id ON translation_glossary_concepts
WHEN NEW.project_id <> OLD.project_id
BEGIN
  SELECT RAISE(ABORT, 'TRANSLATION_GLOSSARY_PROJECT_IMMUTABLE');
END;

DROP TABLE translation_glossary_variant_migration_assert;
