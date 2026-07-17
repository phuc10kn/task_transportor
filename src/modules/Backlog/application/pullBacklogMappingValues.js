const { createBacklogClient } = require("../infrastructure/BacklogClient");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function uniqueValues(values) {
  return Array.from(new Set((values || [])
    .map((value) => String(value === null || value === undefined ? "" : value).trim())
    .filter(Boolean)));
}

function mergeMappingValues(existing, pulled) {
  const merged = { ...(existing || {}) };

  for (const [mappingType, values] of Object.entries(pulled || {})) {
    if (mappingType === "cis_user_emails") {
      continue;
    }

    if (mappingType.endsWith("_directory")) {
      merged[mappingType] = values || [];
      continue;
    }

    merged[mappingType] = uniqueValues([
      ...(merged[mappingType] || []),
      ...values,
    ]);
  }

  return merged;
}

async function pullBacklogMappingValues({ config, projectId }) {
  const project = projectsApi().getProject({ config, projectId });
  const client = createBacklogClient({ config, projectId: project.id });
  const pulled = await client.pullMappingValues();
  const backlogMappingValues = mergeMappingValues(project.backlog_mapping_values_json, pulled);
  const updatedProject = projectsApi().updateProject({
    config,
    projectId,
    input: {
      backlog_mapping_values_json: backlogMappingValues,
    },
  });

  return {
    project: updatedProject,
    pulled,
    backlog_mapping_values_json: updatedProject.backlog_mapping_values_json,
  };
}

module.exports = {
  pullBacklogMappingValues,
};
