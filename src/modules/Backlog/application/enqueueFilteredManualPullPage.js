const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createBacklogClient } = require("../infrastructure/BacklogClient");
const { buildBacklogIssueSnapshot } = require("../support/backlogIssueSnapshot");
const { getIssueActionReadiness } = require("./getIssueActionReadiness");
const { issueProviderQuery, normalizeIssueSearchFilters } = require("./normalizeIssueSearchFilters");

function projectsApi() { return require("../../Projects/ProjectsApi"); }

async function enqueueFilteredManualPullPage({ config, projectId, page, filters, executedBy, correlationId }) {
  const pageNumber = Number(page);
  if (!/^\d+$/.test(String(page || "")) || !Number.isSafeInteger(pageNumber) || pageNumber < 1) {
    throw new AppError({ code: "VALIDATION_ERROR", message: "page must be a positive integer.", status: 422 });
  }
  const project = projectsApi().getProjectConfig({ config, projectId: Number(projectId) });
  const readiness = getIssueActionReadiness({ config, projectId: project.id });
  if (!readiness.actions.sync_to_cis.enabled) {
    const code = readiness.actions.sync_to_cis.disabled_reasons[0] || "BACKLOG_PULL_DISABLED";
    throw new AppError({ code, message: "Filtered Backlog pull is unavailable for this project.", status: code === "SYNC_WORKER_UNAVAILABLE" ? 503 : 422 });
  }
  const normalized = normalizeIssueSearchFilters({ project, filters });
  const client = createBacklogClient({ config, projectId: project.id });
  const remoteProject = await client.getProject(project.backlog_project_key);
  const rows = normalized.noMatchingNotClosedStatus ? [] : await client.listIssues({
    ...issueProviderQuery(normalized, remoteProject.id, { count: 100, offset: (pageNumber - 1) * 100 }),
    sort: "created",
    order: "asc",
  });
  const entries = rows.map((row) => ({
    key: String(row && (row.issueKey || row.key) || "").trim().toUpperCase(),
    snapshot: buildBacklogIssueSnapshot(row, { remoteProjectId: remoteProject.id, projectKey: project.backlog_project_key }),
  }));
  const validEntries = entries.filter((entry) => entry.snapshot);
  const existing = CisApi.getIssuesByBacklogKeys({
    config,
    projectId: project.id,
    backlogIssueKeys: validEntries.map((entry) => entry.key),
  });
  const existingKeys = new Set(existing.map((issue) => String(issue.backlog_issue_key || "").trim().toUpperCase()));
  let newlyQueued = 0;
  let reusedActive = 0;
  let alreadyInCis = 0;

  for (const entry of validEntries) {
    if (existingKeys.has(entry.key)) {
      alreadyInCis += 1;
      continue;
    }
    const enqueueResult = SyncApi.enqueueManualPullIfNoneActive({
      config,
      input: {
        project_id: project.id,
        direction_from: "backlog",
        direction_to: "cis",
        job_type: "manual_pull",
        payload_json: {
          mode: "filtered_pull",
          backlog_issue_key: entry.key,
          backlog_issue_snapshot: entry.snapshot,
          with_translation: false,
          push_to_jira: false,
          requested_by: executedBy || null,
          request_correlation_id: correlationId || null,
        },
        priority: 50,
        max_attempts: 3,
        trigger: "manual",
        executed_by: executedBy || null,
        correlation_id: correlationId || null,
      },
    });
    if (enqueueResult.reused) reusedActive += 1;
    else newlyQueued += 1;
  }

  return {
    page: pageNumber,
    source_rows: rows.length,
    newly_queued: newlyQueued,
    reused_active: reusedActive,
    already_in_cis: alreadyInCis,
    invalid_rows: entries.length - validEntries.length,
  };
}

module.exports = { enqueueFilteredManualPullPage };
