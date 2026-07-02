const EDITABLE_CANONICAL_FIELDS = Object.freeze([
  "summary",
  "description",
  "issue_type",
  "priority",
  "status",
  "assignee",
  "due_date",
]);

const REVISION_CANONICAL_FIELDS = Object.freeze([
  "summary",
  "description",
  "issue_type",
  "priority",
  "assignee",
]);

const READONLY_CANONICAL_FIELDS = Object.freeze(["reporter"]);

const DISALLOWED_EDITOR_FIELDS = Object.freeze([
  "labels",
  "components",
  "fix_versions",
  "fixVersions",
  "customfield",
  "customfields",
  "status_meta",
  "priority_meta",
  "issue_type_meta",
  "description_meta",
]);

const FIELD_TYPES = Object.freeze({
  summary: "string",
  description: "text",
  issue_type: "single_select",
  priority: "single_select",
  status: "single_select",
  assignee: "user",
  due_date: "date",
});

const DEFAULT_CATALOGS = Object.freeze({
  issue_type: ["bug", "task", "feature", "question"],
  priority: ["low", "normal", "high", "urgent"],
  status: ["open", "in_progress", "review", "done"],
  assignee: [],
});

function pickCatalog(project, field) {
  const cisValues = project && project.cis_mapping_values_json && project.cis_mapping_values_json[field];
  if (Array.isArray(cisValues) && cisValues.length > 0) {
    return cisValues;
  }

  const defaults = DEFAULT_CATALOGS[field] || [];
  if (defaults.length > 0) {
    return defaults;
  }

  for (const source of [project && project.backlog_mapping_values_json, project && project.jira_mapping_values_json]) {
    if (source && Array.isArray(source[field]) && source[field].length > 0) {
      return source[field];
    }
  }

  return [];
}

function pickSystemCatalog(project, system, field) {
  const values = project && project[`${system}_mapping_values_json`] && project[`${system}_mapping_values_json`][field];
  if (Array.isArray(values) && values.length > 0) {
    return values;
  }

  return [];
}

function buildFieldMeta(project) {
  return {
    profile: "jira_inspired",
    editable_fields: [...EDITABLE_CANONICAL_FIELDS],
    readonly_fields: [...READONLY_CANONICAL_FIELDS],
    catalogs: {
      issue_type: pickCatalog(project, "issue_type"),
      priority: pickCatalog(project, "priority"),
      status: pickCatalog(project, "status"),
      assignee: pickCatalog(project, "assignee"),
    },
    catalogs_by_system: {
      backlog: {
        issue_type: pickSystemCatalog(project, "backlog", "issue_type"),
        priority: pickSystemCatalog(project, "backlog", "priority"),
        status: pickSystemCatalog(project, "backlog", "status"),
        assignee: pickSystemCatalog(project, "backlog", "assignee"),
      },
      cis: {
        issue_type: pickCatalog(project, "issue_type"),
        priority: pickCatalog(project, "priority"),
        status: pickCatalog(project, "status"),
        assignee: pickCatalog(project, "assignee"),
      },
      jira: {
        issue_type: pickSystemCatalog(project, "jira", "issue_type"),
        priority: pickSystemCatalog(project, "jira", "priority"),
        status: pickSystemCatalog(project, "jira", "status"),
        assignee: pickSystemCatalog(project, "jira", "assignee"),
      },
    },
    field_types: { ...FIELD_TYPES },
  };
}

function isEditableCanonicalField(field) {
  return EDITABLE_CANONICAL_FIELDS.includes(field);
}

function isDisallowedEditorField(field) {
  return (
    DISALLOWED_EDITOR_FIELDS.includes(field) ||
    /^customfield_/i.test(String(field || "")) ||
    (String(field || "").endsWith("_meta") && field !== "assignee_meta")
  );
}

module.exports = {
  DISALLOWED_EDITOR_FIELDS,
  EDITABLE_CANONICAL_FIELDS,
  READONLY_CANONICAL_FIELDS,
  REVISION_CANONICAL_FIELDS,
  buildFieldMeta,
  isDisallowedEditorField,
  isEditableCanonicalField,
};
