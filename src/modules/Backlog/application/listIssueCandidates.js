const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const { createBacklogClient } = require("../infrastructure/BacklogClient");
const { getIssueActionReadiness } = require("./getIssueActionReadiness");

function projectsApi() { return require("../../Projects/ProjectsApi"); }
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

async function listIssueCandidates({ config, projectId, filters }) {
  const from = String(filters.created_from || "");
  const to = String(filters.created_to || "");
  const limit = Number(filters.limit);
  if (!validDate(from) || !validDate(to) || from > to || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError({ code: "VALIDATION_ERROR", message: "created_from, created_to and limit (1..100) are required.", status: 422 });
  }
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  const readiness = getIssueActionReadiness({ config, projectId: project.id });
  if (!readiness.actions.browse.enabled) {
    throw new AppError({ code: "BACKLOG_CONFIG_INCOMPLETE", message: "Backlog configuration is incomplete.", status: 422 });
  }
  const client = createBacklogClient({ config, project });
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

  while (candidates.length < limit && pages < 10 && scanned < 1000 && Date.now() < deadline) {
    let rows;
    try {
      rows = await client.listIssues({
        "projectId[]": remoteProject.id,
        createdSince: from,
        createdUntil: to,
        sort: "created",
        order: "asc",
        count: 100,
        offset,
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
      if (existingKeys.has(key)) { excluded += 1; continue; }
      if (candidates.length < limit) {
        candidates.push({
          backlog_issue_key: key,
          summary: row.summary || "",
          status: row.status && row.status.name || row.status || null,
          created_at_source: row.created || null,
          updated_at_source: row.updated || null,
        });
      }
    }
    if (candidates.length >= limit) { stopReason = "enough_candidates"; break; }
    if (rows.length < 100) { stopReason = "source_exhausted"; break; }
  }
  if (!stopReason) stopReason = Date.now() >= deadline ? "deadline_reached" : "scan_limit_reached";
  return {
    project_id: project.id,
    filters: { created_from: from, created_to: to, limit },
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
