const { AppError } = require("../../../http/errors/AppError");
const { getIssueActionReadiness } = require("./getIssueActionReadiness");

function projectsApi() { return require("../../Projects/ProjectsApi"); }

function normalizeStatuses(rows) {
  return (rows || [])
    .map((status) => ({
      id: Number(status.id),
      name: String(status.name || "").trim(),
      display_order: Number(status.display_order),
    }))
    .filter((status) => Number.isSafeInteger(status.id) && status.id > 0 && status.name)
    .sort((left, right) => (left.display_order - right.display_order) || left.name.localeCompare(right.name));
}

function normalizeAssignees(rows) {
  return (rows || [])
    .map((user) => ({
      id: Number(user.id),
      name: String(user.name || "").trim(),
    }))
    .filter((user) => Number.isSafeInteger(user.id) && user.id > 0 && user.name)
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function listIssueCandidateFilterOptions({ config, projectId }) {
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  const readiness = getIssueActionReadiness({ config, projectId: project.id });

  if (!readiness.actions.browse.enabled) {
    throw new AppError({ code: "BACKLOG_CONFIG_INCOMPLETE", message: "Backlog configuration is incomplete.", status: 422 });
  }

  const mappingValues = project.backlog_mapping_values_json || {};

  return {
    project_id: project.id,
    statuses: normalizeStatuses(mappingValues.status_directory),
    assignees: normalizeAssignees(mappingValues.user_directory),
  };
}

module.exports = { listIssueCandidateFilterOptions };
