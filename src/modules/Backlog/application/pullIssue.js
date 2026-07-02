const { AppError } = require("../../../http/errors/AppError");
const ProjectsApi = require("../../Projects/ProjectsApi");
const SyncApi = require("../../Sync/SyncApi");

function assertPullEnabled(project) {
  if (!project || !project.enabled || !project.manual_pull_enabled) {
    throw new AppError({
      code: "BACKLOG_PULL_DISABLED",
      message: "Backlog manual pull is disabled for this project.",
      status: 422,
    });
  }
}

function pullIssue({ config, projectId, backlogIssueKey, executedBy, correlationId, trigger = "manual" }) {
  const project = ProjectsApi.getProject({ config, projectId: Number(projectId) });
  assertPullEnabled(project);

  return SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      payload_json: {
        mode: "issue",
        backlog_issue_key: backlogIssueKey,
      },
      priority: 50,
      trigger,
      executed_by: executedBy,
      correlation_id: correlationId,
    },
  });
}

module.exports = {
  pullIssue,
};
