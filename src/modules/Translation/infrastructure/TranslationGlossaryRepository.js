const { createConnection } = require("../../../infrastructure/database/connection");
const { runInTransaction } = require("../../../infrastructure/database/transaction");

function rowToTerm(row) {
  return {
    id: row.id,
    language_code: row.language_code,
    term: row.term,
    is_canonical: Boolean(row.is_canonical),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToConcept(row, terms) {
  return {
    id: row.id,
    project_id: row.project_id,
    group_key: row.group_key,
    concept_key: row.concept_key,
    note: row.note,
    created_by: row.created_by,
    updated_by: row.updated_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    terms: terms.map(rowToTerm),
  };
}

function readAggregate(db, conceptId) {
  const concept = db
    .prepare("SELECT * FROM translation_glossary_concepts WHERE id = ?")
    .get(conceptId);
  if (!concept) {
    return null;
  }

  const terms = db
    .prepare(
      `SELECT id, language_code, term, is_canonical, created_at, updated_at
       FROM translation_glossary_terms
       WHERE glossary_concept_id = ?
       ORDER BY language_code ASC, is_canonical DESC, term_match_key ASC, id ASC`
    )
    .all(conceptId);

  return rowToConcept(concept, terms);
}

function insertTerms(db, conceptId, terms) {
  const insert = db.prepare(
    `INSERT INTO translation_glossary_terms
       (glossary_concept_id, language_code, term, is_canonical)
     VALUES (?, ?, ?, ?)`
  );

  for (const term of terms) {
    insert.run(conceptId, term.language_code, term.term, term.is_canonical ? 1 : 0);
  }
}

function createTranslationGlossaryRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });
    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    list({ projectId, groupKey, query } = {}) {
      return withDb((db) => {
        const clauses = ["c.project_id = ?"];
        const values = [projectId];
        const normalizedGroup = String(groupKey || "").trim().toLowerCase();
        const normalizedQuery = String(query || "").trim().toLowerCase();

        if (normalizedGroup) {
          clauses.push("c.group_key = ?");
          values.push(normalizedGroup);
        }

        if (normalizedQuery) {
          const pattern = `%${normalizedQuery}%`;
          clauses.push(`(
            lower(c.group_key) LIKE ? OR
            lower(c.concept_key) LIKE ? OR
            lower(COALESCE(c.note, '')) LIKE ? OR
            lower(COALESCE(t.term, '')) LIKE ?
          )`);
          values.push(pattern, pattern, pattern, pattern);
        }

        const concepts = db
          .prepare(
            `SELECT DISTINCT c.*
             FROM translation_glossary_concepts AS c
             LEFT JOIN translation_glossary_terms AS t
               ON t.glossary_concept_id = c.id
             WHERE ${clauses.join(" AND ")}
             ORDER BY c.group_key ASC, c.concept_key ASC, c.id ASC`
          )
          .all(...values);

        return concepts.map((concept) => readAggregate(db, concept.id));
      });
    },

    findById({ projectId, conceptId }) {
      return withDb((db) => {
        const concept = db
          .prepare(
            `SELECT *
             FROM translation_glossary_concepts
             WHERE id = ? AND project_id = ?`
          )
          .get(conceptId, projectId);
        return concept ? readAggregate(db, concept.id) : null;
      });
    },

    create({ projectId, input, actorId }) {
      return withDb((db) => runInTransaction(db, () => {
        const result = db
          .prepare(
            `INSERT INTO translation_glossary_concepts
             (project_id, group_key, concept_key, note, created_by, updated_by)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .run(projectId, input.group_key, input.concept_key, input.note, actorId || null, actorId || null);

        insertTerms(db, result.lastInsertRowid, input.terms);
        return readAggregate(db, result.lastInsertRowid);
      }));
    },

    update({ projectId, conceptId, input, actorId }) {
      return withDb((db) => runInTransaction(db, () => {
        const existing = db
          .prepare(
            `SELECT id, created_by
             FROM translation_glossary_concepts
             WHERE id = ? AND project_id = ?`
          )
          .get(conceptId, projectId);
        if (!existing) {
          return null;
        }

        db
          .prepare(
            `UPDATE translation_glossary_concepts
             SET group_key = ?, concept_key = ?, note = ?, updated_by = ?, updated_at = datetime('now')
             WHERE id = ? AND project_id = ?`
          )
          .run(input.group_key, input.concept_key, input.note, actorId || null, conceptId, projectId);
        db.prepare("DELETE FROM translation_glossary_terms WHERE glossary_concept_id = ?").run(conceptId);
        insertTerms(db, conceptId, input.terms);
        return readAggregate(db, conceptId);
      }));
    },

    delete({ projectId, conceptId }) {
      return withDb((db) => runInTransaction(db, () => {
        const result = db
          .prepare("DELETE FROM translation_glossary_concepts WHERE id = ? AND project_id = ?")
          .run(conceptId, projectId);
        return result.changes > 0;
      }));
    },

    listRuntimeTerms({ projectId, sourceLanguage, targetLanguage }) {
      return withDb((db) => db
        .prepare(
          `SELECT
             c.group_key,
             c.concept_key,
             c.note,
             c.id AS concept_id,
             source_term.term AS source_term,
             source_term.term_match_key AS source_term_match_key,
             target_term.term AS target_term,
             target_term.is_canonical AS target_is_canonical,
             target_term.language_code AS target_language
           FROM translation_glossary_concepts AS c
           JOIN translation_glossary_terms AS source_term
             ON source_term.glossary_concept_id = c.id
            AND source_term.language_code = ?
           JOIN translation_glossary_terms AS target_term
             ON target_term.glossary_concept_id = c.id
            AND target_term.language_code = ?
            AND target_term.is_canonical = 1
           WHERE c.project_id = ?
           ORDER BY c.group_key ASC, c.concept_key ASC, c.id ASC`
        )
        .all(sourceLanguage, targetLanguage, projectId)
        .map((row) => ({
          concept_id: row.concept_id,
          source: row.source_term,
          source_term_match_key: row.source_term_match_key,
          target: row.target_term,
          target_language: row.target_language,
          notes: row.note,
          group_key: row.group_key,
          concept_key: row.concept_key,
        })));
    },
  };
}

module.exports = {
  createTranslationGlossaryRepository,
  rowToConcept,
  rowToTerm,
};
