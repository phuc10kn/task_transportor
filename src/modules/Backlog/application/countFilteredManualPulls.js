const { AppError } = require("../../../http/errors/AppError");
const { createBacklogClient } = require("../infrastructure/BacklogClient");
const { getIssueActionReadiness } = require("./getIssueActionReadiness");
const { issueProviderQuery, normalizeIssueSearchFilters } = require("./normalizeIssueSearchFilters");

function projectsApi() { return require("../../Projects/ProjectsApi"); }

async function countFilteredManualPulls({ config, projectId, filters }) {
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  const readiness = getIssueActionReadiness({ config, projectId: project.id });
  if (!readiness.actions.browse.enabled) {
    throw new AppError({ code: readiness.actions.browse.disabled_reasons[0] || "BACKLOG_CONFIG_INCOMPLETE", message: "Backlog browse is unavailable for this project.", status: 422 });
  }
  const normalized = normalizeIssueSearchFilters({ project, filters });
  const client = createBacklogClient({ config, projectId: project.id });
  const remoteProject = await client.getProject(project.backlog_project_key);
  const result = normalized.noMatchingNotClosedStatus
    ? { count: 0 }
    : await client.countIssues(issueProviderQuery(normalized, remoteProject.id));
  const sourceCount = Number(result && result.count);
  if (!Number.isSafeInteger(sourceCount) || sourceCount < 0) {
    throw new AppError({ code: "BACKLOG_COUNT_INVALID", message: "Backlog returned an invalid issue count.", status: 502 });
  }
  return { source_count: sourceCount, page_size: 100, total_pages: Math.ceil(sourceCount / 100) };
}

module.exports = { countFilteredManualPulls };
