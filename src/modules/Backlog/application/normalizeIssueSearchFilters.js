const { AppError } = require("../../../http/errors/AppError");

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
  return [...new Set(values.map((raw) => {
    const text = String(raw || "").trim();
    const id = Number(text);
    if (!/^\d+$/.test(text) || !Number.isSafeInteger(id) || id < 1) {
      throw new AppError({ code: "VALIDATION_ERROR", message: `${field} must contain positive integer IDs.`, status: 422 });
    }
    return id;
  }))].sort((left, right) => left - right);
}

function parseBoolean(value, field) {
  if (value === undefined) return false;
  if (Array.isArray(value)) {
    throw new AppError({ code: "VALIDATION_ERROR", message: `${field} must be true or false.`, status: 422 });
  }
  if (typeof value === "boolean") return value;
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
  if (unknownIds.length) {
    throw new AppError({
      code: "BACKLOG_FILTER_VALUE_NOT_CONFIGURED",
      message: `${field} is not in the saved Backlog project configuration. Pull Backlog fields and try again.`,
      status: 422,
      details: { field, ids: unknownIds },
    });
  }
}

function normalizeIssueSearchFilters({ project, filters, requireLimit = false }) {
  const from = String(filters.created_from || "");
  const to = String(filters.created_to || "");
  const statusIds = parsePositiveIdList(filters.status_ids ?? filters.status_id, "status_id");
  const assigneeIds = parsePositiveIdList(filters.assignee_ids ?? filters.assignee_id, "assignee_id");
  const notClosed = parseBoolean(filters.not_closed, "not_closed");
  const limit = requireLimit ? Number(filters.limit) : null;
  if (!validDate(from) || !validDate(to) || from > to || (requireLimit && (!Number.isInteger(limit) || limit < 1 || limit > 100))) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: requireLimit
        ? "created_from, created_to and limit (1..100) are required."
        : "created_from and created_to are required.",
      status: 422,
    });
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

  const allowedNotClosedStatusIds = notClosed
    ? statusDirectory.filter((status) => !["closed", "close"].includes(status.name.toLowerCase())).map((status) => status.id)
    : null;
  const effectiveStatusIds = notClosed
    ? statusIds.length ? statusIds.filter((id) => allowedNotClosedStatusIds.includes(id)) : allowedNotClosedStatusIds
    : statusIds;

  return {
    from,
    to,
    limit,
    statusIds,
    assigneeIds,
    notClosed,
    effectiveStatusIds,
    noMatchingNotClosedStatus: notClosed && effectiveStatusIds.length === 0,
  };
}

function issueProviderQuery(normalized, remoteProjectId, { count, offset } = {}) {
  return {
    "projectId[]": remoteProjectId,
    createdSince: normalized.from,
    createdUntil: normalized.to,
    ...(normalized.effectiveStatusIds.length ? { "statusId[]": normalized.effectiveStatusIds } : {}),
    ...(normalized.assigneeIds.length ? { "assigneeId[]": normalized.assigneeIds } : {}),
    ...(count === undefined ? {} : { count }),
    ...(offset === undefined ? {} : { offset }),
  };
}

module.exports = { issueProviderQuery, normalizeIssueSearchFilters };
