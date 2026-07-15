const MappingApi = require("../../Mapping/MappingApi");

const FIELD_MAPPINGS = Object.freeze([
  ["issue_type", "issue_type"],
  ["priority", "priority"],
  ["status", "status"],
  ["assignee", "user"],
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function applyApprovedBacklogMappings({ config, projectId, normalized }) {
  const next = { ...normalized, fields_json: clone(normalized.fields_json) };
  const applied = [];

  for (const [field, mappingType] of FIELD_MAPPINGS) {
    const sourceValue = next.fields_json[field] && next.fields_json[field].backlog;
    if (sourceValue === null || sourceValue === undefined || sourceValue === "") continue;

    const rule = MappingApi.findApprovedMappingRule({
      config,
      input: {
        project_id: Number(projectId),
        mapping_type: mappingType,
        direction_from: "backlog",
        direction_to: "cis",
        from_value: String(sourceValue),
      },
    });
    if (!rule || rule.to_value === null || rule.to_value === undefined || rule.to_value === "") continue;

    next.fields_json[field] = { ...next.fields_json[field], cis: rule.to_value };
    if (Object.prototype.hasOwnProperty.call(next, field)) next[field] = rule.to_value;
    if (field === "status") next.status_name = rule.to_value;
    applied.push({ field, mapping_type: mappingType, source_value: String(sourceValue), cis_value: String(rule.to_value), rule_id: rule.id });
  }

  return { normalized: next, applied };
}

module.exports = { applyApprovedBacklogMappings };
