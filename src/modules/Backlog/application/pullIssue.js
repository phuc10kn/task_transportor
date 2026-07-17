const { AppError } = require("../../../http/errors/AppError");
const SyncApi = require("../../Sync/SyncApi");
const { assertScopeOperation, createExternalAccessScope } = require("../../../infrastructure/external/createExternalAccessScope");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

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
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  assertPullEnabled(project);
  const scope = createExternalAccessScope({ config, projectId: project.id });
  assertScopeOperation(scope, project.id, "backlog", "backlog.issue.get");

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

async function pullIssueNow({ config, projectId, backlogIssueKey, executedBy, correlationId }) {
  const job = pullIssue({
    config,
    projectId,
    backlogIssueKey,
    executedBy,
    correlationId,
  });
  const result = await SyncApi.runJobNow({
    config,
    jobId: job.id,
    workerId: "admin-manual-pull",
  });

  return result.job || job;
}

module.exports = {
  pullIssue,
  pullIssueNow,
};
