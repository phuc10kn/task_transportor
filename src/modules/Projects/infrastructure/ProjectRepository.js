const { createConnection } = require("../../../infrastructure/database/connection");
const { PROJECT_DEFAULTS } = require("../support/defaultProjectConfig");

const PROJECT_COLUMNS = [
  "name",
  "enabled",
  "sync_enabled",
  "backlog_space_url",
  "backlog_space_key",
  "backlog_project_key",
  "backlog_issue_key_prefix",
  "backlog_api_key_env",
  "backlog_webhook_secret_env",
  "jira_site_url",
  "jira_project_key",
  "jira_email_env",
  "jira_api_token_env",
  "jira_webhook_secret_env",
  "translation_provider",
  "translation_model",
  "translation_command_profile",
  "source_language",
  "target_language",
  "translation_glossary_json",
  "auto_translate",
  "require_translation_review",
  "require_mapping_approval",
  "mapping_scope",
  "cis_mapping_values_json",
  "backlog_mapping_values_json",
  "jira_mapping_values_json",
  "manual_pull_enabled",
  "scheduled_pull_enabled",
  "scheduled_pull_interval_minutes",
  "pull_updated_since_window_minutes",
  "scheduled_pull_filter_json",
];

const BOOLEAN_COLUMNS = new Set([
  "enabled",
  "sync_enabled",
  "auto_translate",
  "require_translation_review",
  "require_mapping_approval",
  "manual_pull_enabled",
  "scheduled_pull_enabled",
]);

function serializeValue(column, value) {
  if (value === undefined) {
    return undefined;
  }

  if (BOOLEAN_COLUMNS.has(column)) {
    return value ? 1 : 0;
  }

  if (column === "scheduled_pull_filter_json") {
    return JSON.stringify(value || PROJECT_DEFAULTS.scheduled_pull_filter_json);
  }

  if ([
    "cis_mapping_values_json",
    "backlog_mapping_values_json",
    "jira_mapping_values_json",
  ].includes(column)) {
    return JSON.stringify(value || {});
  }

  if (column === "translation_glossary_json") {
    return JSON.stringify(value || PROJECT_DEFAULTS.translation_glossary_json);
  }

  return value;
}

function rowToProject(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    enabled: Boolean(row.enabled),
    sync_enabled: Boolean(row.sync_enabled),
    auto_translate: Boolean(row.auto_translate),
    require_translation_review: Boolean(row.require_translation_review),
    require_mapping_approval: Boolean(row.require_mapping_approval),
    manual_pull_enabled: Boolean(row.manual_pull_enabled),
    scheduled_pull_enabled: Boolean(row.scheduled_pull_enabled),
    scheduled_pull_filter_json: JSON.parse(row.scheduled_pull_filter_json),
    cis_mapping_values_json: JSON.parse(row.cis_mapping_values_json || "{}"),
    backlog_mapping_values_json: JSON.parse(row.backlog_mapping_values_json || "{}"),
    jira_mapping_values_json: JSON.parse(row.jira_mapping_values_json || "{}"),
    translation_glossary_json: JSON.parse(row.translation_glossary_json || "[]"),
  };
}

function createProjectRepository({ config }) {
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
        const columns = PROJECT_COLUMNS.filter((column) => input[column] !== undefined);
        const placeholders = columns.map(() => "?").join(", ");
        const values = columns.map((column) => serializeValue(column, input[column]));

        const result = db
          .prepare(`INSERT INTO projects (${columns.join(", ")}) VALUES (${placeholders})`)
          .run(...values);

        return rowToProject(
          db.prepare("SELECT * FROM projects WHERE id = ?").get(result.lastInsertRowid)
        );
      });
    },

    list() {
      return withDb((db) =>
        db
          .prepare("SELECT * FROM projects ORDER BY id ASC")
          .all()
          .map(rowToProject)
      );
    },

    findById(id) {
      return withDb((db) => rowToProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(id)));
    },

    update(id, input) {
      return withDb((db) => {
        const columns = PROJECT_COLUMNS.filter((column) => input[column] !== undefined);
        if (columns.length === 0) {
          return rowToProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(id));
        }

        const assignments = columns.map((column) => `${column} = ?`);
        const values = columns.map((column) => serializeValue(column, input[column]));
        db
          .prepare(
            `UPDATE projects
             SET ${assignments.join(", ")}, updated_at = datetime('now')
             WHERE id = ?`
          )
          .run(...values, id);

        return rowToProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(id));
      });
    },

    remove(id) {
      return withDb((db) => db.prepare("DELETE FROM projects WHERE id = ?").run(id).changes > 0);
    },
  };
}

module.exports = {
  createProjectRepository,
  rowToProject,
};
