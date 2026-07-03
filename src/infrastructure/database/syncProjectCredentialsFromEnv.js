function textOrNull(value) {
  const text = String(value === null || value === undefined ? "" : value).trim();
  return text || null;
}

function credentialFromEnv(env, envName) {
  const key = textOrNull(envName);
  if (!key) {
    return null;
  }

  return textOrNull(env[key]);
}

function collectCredentialUpdates(project, env) {
  return {
    backlog_api_key: textOrNull(project.backlog_api_key)
      ? null
      : credentialFromEnv(env, project.backlog_api_key_env),
    jira_email: textOrNull(project.jira_email)
      ? null
      : credentialFromEnv(env, project.jira_email_env),
    jira_api_token: textOrNull(project.jira_api_token)
      ? null
      : credentialFromEnv(env, project.jira_api_token_env),
  };
}

function updateCredentialFields(db, projectId, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== null);
  if (entries.length === 0) {
    return 0;
  }

  const assignments = entries.map(([field]) => `${field} = ?`);
  const params = entries.map(([, value]) => value);
  db
    .prepare(
      `UPDATE projects
       SET ${assignments.join(", ")}, updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(...params, projectId);

  return entries.length;
}

function syncProjectCredentialsFromEnv({ db, env = process.env }) {
  const projects = db
    .prepare(
      `SELECT
         id,
         name,
         backlog_api_key,
         backlog_api_key_env,
         jira_email,
         jira_email_env,
         jira_api_token,
         jira_api_token_env
       FROM projects`
    )
    .all();

  let updatedProjects = 0;
  let updatedFields = 0;
  const details = [];

  const run = db.transaction(() => {
    for (const project of projects) {
      const updates = collectCredentialUpdates(project, env);
      const changedFields = Object.entries(updates)
        .filter(([, value]) => value !== null)
        .map(([field]) => field);
      const changedCount = updateCredentialFields(db, project.id, updates);

      if (changedCount > 0) {
        updatedProjects += 1;
        updatedFields += changedCount;
        details.push({
          project_id: project.id,
          project_name: project.name,
          fields: changedFields,
        });
      }
    }
  });

  run();

  return {
    scanned_projects: projects.length,
    updated_projects: updatedProjects,
    updated_fields: updatedFields,
    details,
  };
}

module.exports = {
  syncProjectCredentialsFromEnv,
};
