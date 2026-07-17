const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createBacklogClient } = require("../infrastructure/BacklogClient");
const { getIssueActionReadiness } = require("./getIssueActionReadiness");
const { issueProviderQuery, normalizeIssueSearchFilters } = require("./normalizeIssueSearchFilters");

function projectsApi() { return require("../../Projects/ProjectsApi"); }

function candidateAssignee(row) {
  if (!row.assignee) return null;

  const id = Number(row.assignee.id);
  const name = String(row.assignee.name || row.assignee.userId || row.assignee.mailAddress || "").trim();
  return Number.isSafeInteger(id) && id > 0 && name ? { id, name } : null;
}

function activeCandidateJobs({ config, projectId }) {
  const jobs = ["pending", "running"].flatMap((status) => SyncApi.listJobs({
    config,
    filters: { project_id: projectId, status },
  }));
  const jobsByKey = new Map();

  for (const job of jobs) {
    if (!["manual_pull", "sync_translate_jira"].includes(job.job_type) || job.direction_from !== "backlog") continue;
    const key = String(job.payload_json?.backlog_issue_key || "").trim().toUpperCase();
    if (!key) continue;
    const current = jobsByKey.get(key);
    if (!current || (current.status === "pending" && job.status === "running")) jobsByKey.set(key, job);
  }

  return jobsByKey;
}

function candidateActiveJob(job) {
  if (!job) return null;
  return {
    id: job.id,
    status: job.status,
    with_translation: job.payload_json?.with_translation === true,
    push_to_jira: job.payload_json?.push_to_jira === true,
    created_at: job.created_at,
    updated_at: job.updated_at,
  };
}

async function listIssueCandidates({ config, projectId, filters }) {
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  const readiness = getIssueActionReadiness({ config, projectId: project.id });
  if (!readiness.actions.browse.enabled) {
    throw new AppError({ code: "BACKLOG_CONFIG_INCOMPLETE", message: "Backlog configuration is incomplete.", status: 422 });
  }
  const normalizedFilters = normalizeIssueSearchFilters({ project, filters, requireLimit: true });
  const { from, to, limit, statusIds, assigneeIds, notClosed, effectiveStatusIds, noMatchingNotClosedStatus } = normalizedFilters;
  const activeJobsByKey = activeCandidateJobs({ config, projectId: project.id });
  const client = createBacklogClient({ config, projectId: project.id });
  const started = Date.now();
  const deadline = started + 30000;
  const timeout = () => Math.max(1, Math.min(10000, deadline - Date.now()));
  const remoteProject = await client.getProject(project.backlog_project_key, { timeoutMs: timeout() });
  const candidates = [];
  const seen = new Set();
  let offset = 0;
  let pages = 0;
  let scanned = 0;
  let excluded = 0;
  let stopReason = null;
  let providerErrorCode = null;

  while (!noMatchingNotClosedStatus && candidates.length < limit && pages < 10 && scanned < 1000 && Date.now() < deadline) {
    let rows;
    try {
      rows = await client.listIssues({
        ...issueProviderQuery(normalizedFilters, remoteProject.id, { count: 100, offset }),
        sort: "created",
        order: "asc",
      }, { timeoutMs: timeout() });
    } catch (error) {
      if (pages === 0) throw error;
      providerErrorCode = error.code || "BACKLOG_API_ERROR";
      stopReason = "provider_error";
      break;
    }
    pages += 1;
    scanned += rows.length;
    offset += rows.length;
    const page = [];
    for (const row of rows) {
      const key = String(row.issueKey || row.key || "").trim().toUpperCase();
      if (!key || seen.has(key) || Number(row.projectId) !== Number(remoteProject.id)) continue;
      seen.add(key);
      page.push({ row, key });
    }
    const existing = CisApi.getIssuesByBacklogKeys({ config, projectId: project.id, backlogIssueKeys: page.map((item) => item.key) });
    const existingKeys = new Set(existing.map((item) => String(item.backlog_issue_key || "").trim().toUpperCase()));
    for (const { row, key } of page) {
      if (existingKeys.has(key) && !activeJobsByKey.has(key)) { excluded += 1; continue; }
      if (candidates.length < limit) {
        candidates.push({
          backlog_issue_key: key,
          summary: row.summary || "",
          status: row.status && row.status.name || row.status || null,
          assignee: candidateAssignee(row),
          created_at_source: row.created || null,
          updated_at_source: row.updated || null,
          active_job: candidateActiveJob(activeJobsByKey.get(key)),
        });
      }
    }
    if (candidates.length >= limit) { stopReason = "enough_candidates"; break; }
    if (rows.length < 100) { stopReason = "source_exhausted"; break; }
  }
  if (!stopReason) stopReason = noMatchingNotClosedStatus || Date.now() >= deadline ? "source_exhausted" : "scan_limit_reached";
  return {
    project_id: project.id,
    filters: { created_from: from, created_to: to, limit, status_ids: statusIds, assignee_ids: assigneeIds, not_closed: notClosed },
    actions: readiness.actions,
    candidates,
    meta: {
      requested_limit: limit,
      returned_count: candidates.length,
      source_rows_scanned: scanned,
      excluded_existing_cis_count: excluded,
      pages_scanned: pages,
      source_exhausted: stopReason === "source_exhausted",
      scan_limit_reached: stopReason === "scan_limit_reached",
      deadline_reached: stopReason === "deadline_reached",
      stop_reason: stopReason,
      provider_error_code: providerErrorCode,
    },
  };
}

module.exports = { listIssueCandidates };
