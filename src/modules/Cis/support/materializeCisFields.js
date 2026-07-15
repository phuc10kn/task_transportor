const { EDITABLE_CANONICAL_FIELDS } = require("./canonicalIssueFields");

const SOURCE_ORDER = Object.freeze(["backlog", "jira", "revision"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function sourceValuesFromRevision(revisionSnapshot = {}) {
  return {
    summary: revisionSnapshot.summary,
    description: revisionSnapshot.description,
    issue_type: revisionSnapshot.issue_type,
    priority: revisionSnapshot.priority,
    assignee: revisionSnapshot.assignee,
    due_date: revisionSnapshot.due_date,
  };
}

function materializeCisFields(fieldsJson, options = {}) {
  const next = clone(fieldsJson);
  const revisionValues = sourceValuesFromRevision(options.revision || {});

  for (const field of EDITABLE_CANONICAL_FIELDS) {
    const current = next[field] && typeof next[field] === "object" && !Array.isArray(next[field])
      ? { ...next[field] }
      : {};

    if (hasValue(current.cis)) {
      next[field] = current;
      continue;
    }

    for (const source of SOURCE_ORDER) {
      const candidate = source === "revision" ? revisionValues[field] : current[source];
      if (hasValue(candidate)) {
        current.cis = candidate;
        break;
      }
    }

    if (Object.keys(current).length > 0) {
      next[field] = current;
    }
  }

  return next;
}

function mergeSourceFields(existingFieldsJson, incomingFieldsJson, sourceSystem) {
  const next = clone(existingFieldsJson);

  for (const [field, incoming] of Object.entries(incomingFieldsJson || {})) {
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
      next[field] = incoming;
      continue;
    }

    const current = next[field] && typeof next[field] === "object" && !Array.isArray(next[field])
      ? { ...next[field] }
      : {};

    for (const [source, value] of Object.entries(incoming)) {
      if (source === "cis" && hasValue(current.cis)) {
        if (sourceSystem === "backlog" && hasValue(current.backlog) && current.cis === current.backlog) {
          current.cis = value;
        }
        continue;
      }
      current[source] = value;
    }

    if (sourceSystem && Object.prototype.hasOwnProperty.call(incoming, sourceSystem)) {
      current[sourceSystem] = incoming[sourceSystem];
    }

    next[field] = current;
  }

  return materializeCisFields(next);
}

module.exports = {
  hasValue,
  materializeCisFields,
  mergeSourceFields,
};
