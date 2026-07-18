const { AppError } = require("../../../http/errors/AppError");
const BacklogApi = require("../../Backlog/BacklogApi");
const JiraApi = require("../../Jira/JiraApi");
const { requireProjectOwner } = require("./projectAccess");
const { saveProjectMappingValues } = require("./saveProjectMappingValues");

const SYSTEM_FIELDS = {
  backlog: "backlog_mapping_values_json",
  jira: "jira_mapping_values_json",
};

function uniqueValues(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set((values || [])
    .map((value) => String(value === null || value === undefined ? "" : value).trim())
    .filter(Boolean)));
}

function normalizeMappingValues(pulled) {
  const normalized = {};

  for (const [mappingType, values] of Object.entries(pulled || {})) {
    if (mappingType === "cis_user_emails" || mappingType.endsWith("_directory")) {
      continue;
    }

    if (mappingType.endsWith("_labels")) {
      if (values && typeof values === "object" && !Array.isArray(values)) {
        normalized[mappingType] = values;
      }
      continue;
    }

    normalized[mappingType] = uniqueValues(values);
  }

  return normalized;
}

function sameValues(left, right) {
  return JSON.stringify(uniqueValues(left)) === JSON.stringify(uniqueValues(right));
}

function hasMappingValues(mappingValues) {
  return Object.entries(mappingValues || {})
    .filter(([mappingType]) => !mappingType.endsWith("_labels") && !mappingType.endsWith("_directory"))
    .some(([, values]) => uniqueValues(values).length > 0);
}

function replacementWarnings(existingCisValues, nextCisValues) {
  return Object.entries(nextCisValues)
    .filter(([mappingType]) => !mappingType.endsWith("_labels") && !mappingType.endsWith("_directory"))
    .filter(([mappingType, values]) => {
      const current = uniqueValues(existingCisValues && existingCisValues[mappingType]);
      return current.length > 0 && !sameValues(current, values);
    })
    .map(([mappingType, values]) => ({
      code: "CIS_MAPPING_VALUES_EXIST",
      mapping_type: mappingType,
      message: `CIS mapping values for '${mappingType}' already existed and were replaced.`,
      previous_values: uniqueValues(existingCisValues[mappingType]),
      next_values: uniqueValues(values),
    }));
}

async function pullTargetMappingValues({ config, project, targetSystem }) {
  if (targetSystem === "backlog") {
    const result = await BacklogApi.pullBacklogMappingValues({ config, projectId: project.id });
    return result.pulled;
  }

  if (targetSystem === "jira") {
    const result = await JiraApi.pullJiraMappingValues({ config, projectId: project.id });
    return result.pulled;
  }

  throw new AppError({
    code: "UNSUPPORTED_MAPPING_TARGET_SYSTEM",
    message: `Mapping target system '${targetSystem}' is not supported.`,
    status: 422,
    details: {
      target_system: targetSystem,
      supported_systems: Object.keys(SYSTEM_FIELDS),
    },
  });
}

async function syncCisMappingValuesFromTarget({ config, projectId, actorUserId, targetSystem }) {
  const project = requireProjectOwner({ config, projectId, actorUserId });
  const normalizedTarget = String(targetSystem || "").trim().toLowerCase();
  const systemField = SYSTEM_FIELDS[normalizedTarget];

  if (!systemField) {
    throw new AppError({
      code: "TARGET_SYSTEM_REQUIRED",
      message: "Target system must be one of: backlog, jira.",
      status: 422,
      details: {
        supported_systems: Object.keys(SYSTEM_FIELDS),
      },
    });
  }

  const configuredValues = project[systemField] || {};
  const shouldUseConfiguredValues = hasMappingValues(configuredValues);
  const pulled = shouldUseConfiguredValues
    ? (
      normalizedTarget === "jira"
        ? JiraApi.sanitizeJiraMappingValues({
          mappingValues: configuredValues,
          isRealJiraUserMappingEntry: JiraApi.isRealJiraUserMappingEntry,
        })
        : configuredValues
    )
    : await pullTargetMappingValues({
      config,
      project,
      targetSystem: normalizedTarget,
    });
  const nextValues = normalizeMappingValues(pulled);
  const directories = Object.fromEntries(Object.entries(pulled || {})
    .filter(([mappingType]) => mappingType.endsWith("_directory")));
  const warnings = replacementWarnings(project.cis_mapping_values_json || {}, nextValues);
  const updatedProject = saveProjectMappingValues({
    config,
    projectId,
    system: normalizedTarget,
    systemMappingValues: { ...configuredValues, ...nextValues, ...directories },
    cisMappingValues: nextValues,
  });

  return {
    project: updatedProject,
    target_system: normalizedTarget,
    source: shouldUseConfiguredValues ? "project_config" : "target_pull",
    pulled,
    warnings,
    cis_mapping_values_json: updatedProject.cis_mapping_values_json,
    [`${normalizedTarget}_mapping_values_json`]: updatedProject[systemField],
  };
}

module.exports = {
  syncCisMappingValuesFromTarget,
};
