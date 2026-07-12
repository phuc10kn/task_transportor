const { AppError } = require("../../../http/errors/AppError");
const { createBacklogClient } = require("../infrastructure/BacklogClient");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

async function lookupBacklogIssueIdentity({ config, projectId, lookupToken }) {
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  const client = createBacklogClient({ config, project });
  try {
    const [remoteProject, issue] = await Promise.all([
      client.getProject(project.backlog_project_key),
      client.getIssue(String(lookupToken || "").trim()),
    ]);
    if (Number(issue.projectId) !== Number(remoteProject.id)) {
      throw new AppError({
        code: "EXTERNAL_ISSUE_PROJECT_MISMATCH",
        message: "Backlog issue belongs to another project.",
        status: 422,
      });
    }
    return {
      canonical_key: String(issue.issueKey || issue.key || "").trim().toUpperCase(),
      external_id: issue.id || null,
      external_project_identity: remoteProject.id,
    };
  } catch (error) {
    if (error.code === "BACKLOG_ISSUE_NOT_FOUND") {
      error.status = 422;
    }
    throw error;
  }
}

module.exports = { lookupBacklogIssueIdentity };
