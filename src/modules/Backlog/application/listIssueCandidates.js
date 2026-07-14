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

function parsePositiveIdList(value, field) {
  const values = value === undefined ? [] : Array.isArray(value) ? value : [value];

  if (values.length > 100) {
    throw new AppError({ code: "VALIDATION_ERROR", message: `${field} accepts at most 100 values.`, status: 422 });
  }

  const ids = values.map((raw) => {
    const text = String(raw || "").trim();
    const id = Number(text);
    if (!/^\d+$/.test(text) || !Number.isSafeInteger(id) || id < 1) {
      throw new AppError({ code: "VALIDATION_ERROR", message: `${field} must contain positive integer IDs.`, status: 422 });
    }
    return id;
  });

  return [...new Set(ids)].sort((left, right) => left - right);
}

function parseBoolean(value, field) {
  if (value === undefined) return false;
  if (Array.isArray(value)) {
    throw new AppError({ code: "VALIDATION_ERROR", message: `${field} must be true or false.`, status: 422 });
  }

  const text = String(value).trim().toLowerCase();
  if (text === "true") return true;
  if (text === "false") return false;
  throw new AppError({ code: "VALIDATION_ERROR", message: `${field} must be true or false.`, status: 422 });
}

function configuredDirectory(rows) {
  return (rows || [])
    .map((row) => ({ id: Number(row.id), name: String(row.name || "").trim() }))
    .filter((row) => Number.isSafeInteger(row.id) && row.id > 0 && row.name);
}

function assertConfiguredIds(ids, directory, field) {
  const availableIds = new Set(directory.map((row) => row.id));
  const unknownIds = ids.filter((id) => !availableIds.has(id));
  if (unknownIds.length > 0) {
    throw new AppError({
      code: "BACKLOG_FILTER_VALUE_NOT_CONFIGURED",
      message: `${field} is not in the saved Backlog project configuration. Pull Backlog fields and try again.`,
      status: 422,
      details: { field, ids: unknownIds },
    });
  }
}

function candidateAssignee(row) {
  if (!row.assignee) return null;

  const id = Number(row.assignee.id);
  const name = String(row.assignee.name || row.assignee.userId || row.assignee.mailAddress || "").trim();
  return Number.isSafeInteger(id) && id > 0 && name ? { id, name } : null;
}

async function listIssueCandidates({ config, projectId, filters }) {
  const from = String(filters.created_from || "");
  const to = String(filters.created_to || "");
  const limit = Number(filters.limit);
  const statusIds = parsePositiveIdList(filters.status_id, "status_id");
  const assigneeIds = parsePositiveIdList(filters.assignee_id, "assignee_id");
  const notClosed = parseBoolean(filters.not_closed, "not_closed");
  if (!validDate(from) || !validDate(to) || from > to || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError({ code: "VALIDATION_ERROR", message: "created_from, created_to and limit (1..100) are required.", status: 422 });
  }
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  const readiness = getIssueActionReadiness({ config, projectId: project.id });
  if (!readiness.actions.browse.enabled) {
    throw new AppError({ code: "BACKLOG_CONFIG_INCOMPLETE", message: "Backlog configuration is incomplete.", status: 422 });
  }
  const mappingValues = project.backlog_mapping_values_json || {};
  const statusDirectory = configuredDirectory(mappingValues.status_directory);
  const userDirectory = configuredDirectory(mappingValues.user_directory);
  assertConfiguredIds(statusIds, statusDirectory, "status_id");
  assertConfiguredIds(assigneeIds, userDirectory, "assignee_id");
  if (notClosed && statusDirectory.length === 0) {
    throw new AppError({
      code: "BACKLOG_STATUS_DIRECTORY_REQUIRED",
      message: "Saved Backlog status configuration is required for Not closed. Pull Backlog fields and try again.",
      status: 422,
    });
  }
  const client = createBacklogClient({ config, project });
  const started = Date.now();
  const deadline = started + 30000;
  const timeout = () => Math.max(1, Math.min(10000, deadline - Date.now()));
  const remoteProject = await client.getProject(project.backlog_project_key, { timeoutMs: timeout() });
  const allowedNotClosedStatusIds = notClosed
    ? statusDirectory
      .filter((status) => !["closed", "close"].includes(status.name.toLowerCase()))
      .map((status) => status.id)
    : null;
  const effectiveStatusIds = notClosed
    ? statusIds.length
      ? statusIds.filter((id) => allowedNotClosedStatusIds.includes(id))
      : allowedNotClosedStatusIds
    : statusIds;
  const noMatchingNotClosedStatus = notClosed && effectiveStatusIds.length === 0;
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
        "projectId[]": remoteProject.id,
        createdSince: from,
        createdUntil: to,
        ...(effectiveStatusIds.length ? { "statusId[]": effectiveStatusIds } : {}),
        ...(assigneeIds.length ? { "assigneeId[]": assigneeIds } : {}),
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
          assignee: candidateAssignee(row),
          created_at_source: row.created || null,
          updated_at_source: row.updated || null,
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
