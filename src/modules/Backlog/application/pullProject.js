const { AppError } = require("../../../http/errors/AppError");
const ProjectsApi = require("../../Projects/ProjectsApi");
const SyncApi = require("../../Sync/SyncApi");
const { createBacklogClient } = require("../infrastructure/BacklogClient");
const { parseScheduledPullFilter } = require("../support/parseScheduledPullFilter");

function assertProjectPullConfig(project) {
  if (!project || !project.enabled || !project.manual_pull_enabled) {
    throw new AppError({
      code: "BACKLOG_PULL_DISABLED",
      message: "Backlog project pull is disabled for this project.",
      status: 422,
    });
  }

  if (!project.backlog_project_key) {
    throw new AppError({
      code: "BACKLOG_CONFIG_REQUIRED",
      message: "Backlog project key is required.",
      status: 422,
    });
  }
}

async function pullProject({ config, projectId, executedBy, correlationId, trigger = "manual" }) {
  const project = ProjectsApi.getProject({ config, projectId: Number(projectId) });
  assertProjectPullConfig(project);

  const client = createBacklogClient({ config, project });
  const filter = parseScheduledPullFilter(project);
  const backlogProject = await client.getProject(project.backlog_project_key);
  const issues = await client.listIssues({
    "projectId[]": backlogProject.id,
    sort: "updated",
    order: "asc",
    count: filter.page_size,
  });

  const jobs = [];
  for (const issue of issues) {
    const backlogIssueKey = issue.issueKey || issue.key;
    if (!backlogIssueKey) {
      continue;
    }

    jobs.push(SyncApi.enqueueJob({
      config,
      input: {
        project_id: project.id,
        direction_from: "backlog",
        direction_to: "cis",
        job_type: "manual_pull",
        payload_json: {
          mode: "project",
          backlog_issue_key: backlogIssueKey,
        },
        priority: 60,
        trigger,
        executed_by: executedBy,
        correlation_id: correlationId,
      },
    }));
  }

  return {
    project_id: project.id,
    enqueued: jobs.length,
    jobs,
  };
}

module.exports = {
  pullProject,
};
