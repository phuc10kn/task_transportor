const { createConnection } = require("../../../infrastructure/database/connection");

const MAPPING_COLUMNS = [
  "project_id",
  "mapping_type",
  "direction_from",
  "direction_to",
  "from_value",
  "to_value",
  "confidence",
  "source_type",
  "approval_status",
];

function rowToMapping(row) {
  return row || null;
}

function createMappingRepository({ config }) {
  function withDb(callback) {
    const db = createConnection({ config });

    try {
      return callback(db);
    } finally {
      db.close();
    }
  }

  return {
    create(input) {
      return withDb((db) => {
        const columns = MAPPING_COLUMNS.filter((column) => input[column] !== undefined);
        const placeholders = columns.map(() => "?").join(", ");
        const values = columns.map((column) => input[column]);
        const result = db
          .prepare(`INSERT INTO mapping_rules (${columns.join(", ")}) VALUES (${placeholders})`)
          .run(...values);

        return rowToMapping(db.prepare("SELECT * FROM mapping_rules WHERE id = ?").get(result.lastInsertRowid));
      });
    },

    list(filters = {}) {
      return withDb((db) => {
        const clauses = [];
        const values = [];

        for (const column of [
          "project_id",
          "mapping_type",
          "direction_from",
          "direction_to",
          "approval_status",
        ]) {
          if (filters[column] !== undefined) {
            clauses.push(`${column} = ?`);
            values.push(filters[column]);
          }
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
        return db
          .prepare(`SELECT * FROM mapping_rules ${where} ORDER BY id ASC`)
          .all(...values)
          .map(rowToMapping);
      });
    },

    listSystemFieldValues({ projectId, system, mappingTypes }) {
      return withDb((db) => {
        const rows = db
          .prepare(
            `SELECT id, fields_json
             FROM issues
             WHERE project_id = ?
             ORDER BY updated_at DESC, created_at DESC`
          )
          .all(projectId);
        const valuesByKey = new Map();

        for (const row of rows) {
          let fields = {};
          try {
            fields = JSON.parse(row.fields_json || "{}");
          } catch (error) {
            fields = {};
          }

          for (const mappingType of mappingTypes) {
            const fieldValue = fields[mappingType] && fields[mappingType][system];
            if (fieldValue === null || fieldValue === undefined || fieldValue === "") {
              continue;
            }

            const key = `${mappingType}:${String(fieldValue)}`;
            const existing = valuesByKey.get(key) || {
              mapping_type: mappingType,
              system,
              from_value: String(fieldValue),
              issue_count: 0,
              example_issue_ids: [],
            };

            existing.issue_count += 1;
            if (existing.example_issue_ids.length < 3) {
              existing.example_issue_ids.push(row.id);
            }

            valuesByKey.set(key, existing);
          }
        }

        return Array.from(valuesByKey.values()).sort((a, b) => {
          if (a.mapping_type !== b.mapping_type) {
            return a.mapping_type.localeCompare(b.mapping_type);
          }

          return a.from_value.localeCompare(b.from_value);
        });
      });
    },

    findById(ruleId) {
      return withDb((db) =>
        rowToMapping(db.prepare("SELECT * FROM mapping_rules WHERE id = ?").get(ruleId))
      );
    },

    findApproved(input) {
      return withDb((db) =>
        rowToMapping(
          db
            .prepare(
              `SELECT * FROM mapping_rules
               WHERE project_id = ?
                 AND mapping_type = ?
                 AND direction_from = ?
                 AND direction_to = ?
                 AND from_value = ?
                 AND approval_status = 'approved'
               ORDER BY id ASC
               LIMIT 1`
            )
            .get(
              input.project_id,
              input.mapping_type,
              input.direction_from,
              input.direction_to,
              input.from_value
            )
        )
      );
    },

    update(ruleId, input) {
      return withDb((db) => {
        const columns = MAPPING_COLUMNS.filter((column) => input[column] !== undefined);
        if (columns.length === 0) {
          return rowToMapping(db.prepare("SELECT * FROM mapping_rules WHERE id = ?").get(ruleId));
        }

        const assignments = columns.map((column) => `${column} = ?`);
        const values = columns.map((column) => input[column]);
        db
          .prepare(
            `UPDATE mapping_rules
             SET ${assignments.join(", ")}, updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(...values, ruleId);

        return rowToMapping(db.prepare("SELECT * FROM mapping_rules WHERE id = ?").get(ruleId));
      });
    },

    approve(ruleId, input = {}) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE mapping_rules
             SET approval_status = 'approved',
                 confidence = CASE WHEN confidence < 1.0 THEN 1.0 ELSE confidence END,
                 approved_by = ?,
                 approved_at = datetime('now'),
                 rejected_reason = NULL,
                 last_confirmed_at = datetime('now'),
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(input.approved_by || null, ruleId);

        return rowToMapping(db.prepare("SELECT * FROM mapping_rules WHERE id = ?").get(ruleId));
      });
    },

    reject(ruleId, input = {}) {
      return withDb((db) => {
        db
          .prepare(
            `UPDATE mapping_rules
             SET approval_status = 'rejected',
                 rejected_reason = ?,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(input.rejected_reason || null, ruleId);

        return rowToMapping(db.prepare("SELECT * FROM mapping_rules WHERE id = ?").get(ruleId));
      });
    },

    remove(ruleId) {
      return withDb((db) => db.prepare("DELETE FROM mapping_rules WHERE id = ?").run(ruleId).changes > 0);
    },
  };
}

module.exports = {
  createMappingRepository,
  rowToMapping,
};
