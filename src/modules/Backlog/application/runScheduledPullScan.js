const { createConnection } = require("../../../infrastructure/database/connection");
const { pullProject } = require("./pullProject");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function isDue(project, state) {
  if (!state || !state.last_successful_pull_at) {
    return true;
  }

  const last = new Date(`${state.last_successful_pull_at}Z`).getTime();
  const intervalMs = project.scheduled_pull_interval_minutes * 60 * 1000;

  return Date.now() - last >= intervalMs;
}

function listPullState(config) {
  const db = createConnection({ config });
  try {
    return db
      .prepare("SELECT * FROM pull_state WHERE source_system = 'backlog'")
      .all()
      .reduce((map, row) => {
        map[row.project_id] = row;
        return map;
      }, {});
  } finally {
    db.close();
  }
}

function upsertPullState(config, projectId) {
  const db = createConnection({ config });
  try {
    db
      .prepare(
        `INSERT INTO pull_state (
          project_id,
          source_system,
          last_successful_pull_at,
          last_attempted_pull_at,
          cursor_json
        )
        VALUES (?, 'backlog', datetime('now'), datetime('now'), '{}')
        ON CONFLICT(project_id, source_system)
        DO UPDATE SET
          last_successful_pull_at = datetime('now'),
          last_attempted_pull_at = datetime('now'),
          updated_at = datetime('now')`
      )
      .run(projectId);
  } finally {
    db.close();
  }
}

async function runScheduledPullScan({ config }) {
  const states = listPullState(config);
  const projects = projectsApi().listProjects({ config })
    .filter((project) =>
      project.enabled &&
      project.sync_enabled &&
      project.scheduled_pull_enabled &&
      project.backlog_project_key &&
      (project.backlog_api_key || config.backlog.fakeFixturePath) &&
      isDue(project, states[project.id])
    );

  const results = [];
  for (const project of projects) {
    const result = await pullProject({
      config,
      projectId: project.id,
      trigger: "scheduled",
    });
    upsertPullState(config, project.id);
    results.push(result);
  }

  return {
    scanned_projects: projects.length,
    results,
  };
}

module.exports = {
  runScheduledPullScan,
};
