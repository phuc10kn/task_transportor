const { AppError } = require("../../../http/errors/AppError");
const { createJiraClient } = require("../infrastructure/JiraClient");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

async function lookupJiraIssueIdentity({ config, projectId, lookupToken }) {
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  const client = createJiraClient({ config, project });
  try {
    const issue = await client.getIssue(String(lookupToken || "").trim());
    const remoteProjectKey = issue.fields && issue.fields.project && issue.fields.project.key;
    if (!remoteProjectKey || String(remoteProjectKey).toUpperCase() !== String(project.jira_project_key || "").toUpperCase()) {
      throw new AppError({
        code: "EXTERNAL_ISSUE_PROJECT_MISMATCH",
        message: "Jira issue belongs to another project.",
        status: 422,
      });
    }
    return {
      canonical_key: String(issue.key || "").trim().toUpperCase(),
      external_id: issue.id || null,
      external_project_identity: remoteProjectKey,
    };
  } catch (error) {
    if (["JIRA_ISSUE_NOT_FOUND", "JIRA_RESOURCE_NOT_FOUND"].includes(error.code)) {
      error.code = "JIRA_ISSUE_NOT_FOUND";
      error.status = 422;
    }
    throw error;
  }
}

module.exports = { lookupJiraIssueIdentity };
