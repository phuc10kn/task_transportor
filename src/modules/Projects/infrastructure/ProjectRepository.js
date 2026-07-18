const { createConnection } = require("../../../infrastructure/database/connection");
const {
  TRANSLATION_AI_PROVIDERS,
  defaultTranslationAiModelFor,
} = require("../../../shared/translationModels");
const { PROJECT_DEFAULTS } = require("../support/defaultProjectConfig");

const PROJECT_COLUMNS = [
  "name",
  "team_id",
  "owner_user_id",
  "enabled",
  "sync_enabled",
  "backlog_space_url",
  "backlog_space_key",
  "backlog_project_key",
  "backlog_issue_key_prefix",
  "backlog_api_key",
  "backlog_api_key_env",
  "backlog_webhook_secret_env",
  "jira_site_url",
  "jira_project_key",
  "jira_email",
  "jira_email_env",
  "jira_api_token",
  "jira_api_token_env",
  "jira_webhook_secret_env",
  "translation_ai_provider",
  "translation_ai_transport",
  "translation_ai_model",
  "translation_provider",
  "translation_model",
  "translation_command_profile",
  "source_language",
  "target_language",
  "auto_translate",
  "require_translation_review",
  "require_mapping_approval",
  "mapping_scope",
  "cis_mapping_values_json",
  "backlog_mapping_values_json",
  "jira_mapping_values_json",
  "manual_pull_enabled",
  "scheduled_pull_enabled",
  "backlog_external_read_enabled",
  "jira_external_read_enabled",
  "jira_external_write_enabled",
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
  "backlog_external_read_enabled",
  "jira_external_read_enabled",
  "jira_external_write_enabled",
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

  return value;
}

function rowToProject(row) {
  if (!row) {
    return null;
  }

  const translationAiProvider = row.translation_ai_provider || row.translation_provider || PROJECT_DEFAULTS.translation_ai_provider;
  const translationAiTransport = row.translation_ai_transport || PROJECT_DEFAULTS.translation_ai_transport;
  const translationAiModel = row.translation_ai_model || row.translation_model || defaultTranslationAiModelFor(translationAiProvider);

  const project = {
    ...row,
    translation_ai_provider: translationAiProvider,
    translation_ai_transport: translationAiTransport,
    translation_ai_model: translationAiModel,
    translation_provider: row.translation_provider || translationAiProvider,
    translation_model: row.translation_model || translationAiModel,
    enabled: Boolean(row.enabled),
    sync_enabled: Boolean(row.sync_enabled),
    auto_translate: Boolean(row.auto_translate),
    require_translation_review: Boolean(row.require_translation_review),
    require_mapping_approval: Boolean(row.require_mapping_approval),
    manual_pull_enabled: Boolean(row.manual_pull_enabled),
    scheduled_pull_enabled: Boolean(row.scheduled_pull_enabled),
    backlog_external_read_enabled: Boolean(row.backlog_external_read_enabled),
    jira_external_read_enabled: Boolean(row.jira_external_read_enabled),
    jira_external_write_enabled: Boolean(row.jira_external_write_enabled),
    scheduled_pull_filter_json: JSON.parse(row.scheduled_pull_filter_json),
    cis_mapping_values_json: JSON.parse(row.cis_mapping_values_json || "{}"),
    backlog_mapping_values_json: JSON.parse(row.backlog_mapping_values_json || "{}"),
    jira_mapping_values_json: JSON.parse(row.jira_mapping_values_json || "{}"),
  };
  if (row.team_role !== undefined) project.access = { team_role: row.team_role, is_owner: Boolean(row.is_owner) };
  return project;
}

function insertProject(db, input) {
  const columns = PROJECT_COLUMNS.filter((column) => input[column] !== undefined);
  const placeholders = columns.map(() => "?").join(", ");
  const values = columns.map((column) => serializeValue(column, input[column]));
  const result = db.prepare(`INSERT INTO projects (${columns.join(", ")}) VALUES (${placeholders})`).run(...values);
  return result.lastInsertRowid;
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
    createForUser(input, userId) {
      return withDb((db) => {
        return db.transaction(() => {
          const team = db.prepare("INSERT INTO teams (name) VALUES (?)").run(`${input.name} Team`);
          db.prepare("INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'lead')").run(team.lastInsertRowid, userId);
          const projectId = insertProject(db, { ...input, team_id: team.lastInsertRowid, owner_user_id: userId });
          return rowToProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId));
        })();
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

    listForUser(userId) {
      return withDb((db) => db.prepare(
        `SELECT p.*, tm.role AS team_role, (p.owner_user_id = ?) AS is_owner
         FROM projects p JOIN team_members tm ON tm.team_id = p.team_id
         WHERE tm.user_id = ? ORDER BY p.id ASC`
      ).all(userId, userId).map(rowToProject));
    },

    findById(id) {
      return withDb((db) => rowToProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(id)));
    },

    findByIdForUser(id, userId) {
      return withDb((db) => rowToProject(db.prepare(
        `SELECT p.*, tm.role AS team_role, (p.owner_user_id = ?) AS is_owner
         FROM projects p JOIN team_members tm ON tm.team_id = p.team_id
         WHERE p.id = ? AND tm.user_id = ?`
      ).get(userId, id, userId)));
    },

    getTeam(projectId) {
      return withDb((db) => {
        const project = db.prepare("SELECT id, team_id, owner_user_id FROM projects WHERE id = ?").get(projectId);
        if (!project) return null;
        const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(project.team_id);
        const members = db.prepare(
          `SELECT u.id, u.email, u.name, tm.role, (u.id = ?) AS is_owner
           FROM team_members tm JOIN users u ON u.id = tm.user_id
           WHERE tm.team_id = ? ORDER BY tm.role ASC, u.email ASC`
        ).all(project.owner_user_id, project.team_id).map((row) => ({ ...row, is_owner: Boolean(row.is_owner) }));
        return { id: team.id, name: team.name, project_id: project.id, owner_user_id: project.owner_user_id, members };
      });
    },

    addMember(projectId, userId, role) {
      return withDb((db) => {
        const project = db.prepare("SELECT team_id FROM projects WHERE id = ?").get(projectId);
        if (!project) return null;
        try { db.prepare("INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)").run(project.team_id, userId, role); }
        catch (error) { if (!String(error.message).includes("UNIQUE")) throw error; return { duplicate: true }; }
        return this.getTeam(projectId);
      });
    },

    updateMemberRole(projectId, userId, role) {
      return withDb((db) => {
        const project = db.prepare("SELECT team_id, owner_user_id FROM projects WHERE id = ?").get(projectId);
        if (!project) return null;
        if (project.owner_user_id === userId && role !== "lead") return { ownerProtected: true };
        const changed = db.prepare("UPDATE team_members SET role = ?, updated_at = datetime('now') WHERE team_id = ? AND user_id = ?")
          .run(role, project.team_id, userId).changes;
        return changed ? { updated: true } : { missing: true };
      });
    },

    removeMember(projectId, userId) {
      return withDb((db) => {
        const project = db.prepare("SELECT team_id, owner_user_id FROM projects WHERE id = ?").get(projectId);
        if (!project) return null;
        if (project.owner_user_id === userId) return { ownerProtected: true };
        return { removed: db.prepare("DELETE FROM team_members WHERE team_id = ? AND user_id = ?").run(project.team_id, userId).changes > 0 };
      });
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

    removeWithTeam(id) {
      return withDb((db) => db.transaction(() => {
        const project = db.prepare("SELECT team_id FROM projects WHERE id = ?").get(id);
        if (!project) return false;
        db.prepare("DELETE FROM projects WHERE id = ?").run(id);
        db.prepare("DELETE FROM teams WHERE id = ?").run(project.team_id);
        return true;
      })());
    },
  };
}

module.exports = {
  createProjectRepository,
  rowToProject,
};
