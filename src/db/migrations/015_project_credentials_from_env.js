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

function updateCredentialFields(db, projectId, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== null);
  if (entries.length === 0) {
    return;
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
}

function up({ db, env = process.env }) {
  const projects = db
    .prepare(
      `SELECT
         id,
         backlog_api_key,
         backlog_api_key_env,
         jira_email,
         jira_email_env,
         jira_api_token,
         jira_api_token_env
       FROM projects`
    )
    .all();

  for (const project of projects) {
    updateCredentialFields(db, project.id, {
      backlog_api_key: textOrNull(project.backlog_api_key)
        ? null
        : credentialFromEnv(env, project.backlog_api_key_env),
      jira_email: textOrNull(project.jira_email)
        ? null
        : credentialFromEnv(env, project.jira_email_env),
      jira_api_token: textOrNull(project.jira_api_token)
        ? null
        : credentialFromEnv(env, project.jira_api_token_env),
    });
  }
}

module.exports = {
  up,
};
