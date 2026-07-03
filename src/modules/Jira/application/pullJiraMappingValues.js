const { createJiraClient } = require("../infrastructure/JiraClient");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function uniqueValues(values) {
  return Array.from(new Set((values || [])
    .map((value) => String(value === null || value === undefined ? "" : value).trim())
    .filter(Boolean)));
}

function emailValues(values) {
  return uniqueValues(values).filter((value) => value.includes("@"));
}

function replaceMappingValues(existing, pulled) {
  const updated = { ...(existing || {}) };

  for (const [mappingType, values] of Object.entries(pulled || {})) {
    if (mappingType === "cis_user_emails") {
      continue;
    }

    if (mappingType === "user" && emailValues(values).length > 0) {
      updated[mappingType] = emailValues(values);
      continue;
    }

    updated[mappingType] = uniqueValues(values);
  }

  return updated;
}

async function pullJiraMappingValues({ config, projectId }) {
  const project = projectsApi().getProject({ config, projectId });
  const client = createJiraClient({ config, project });
  const pulled = await client.pullMappingValues();
  const jiraMappingValues = replaceMappingValues(project.jira_mapping_values_json, pulled);
  const updatedProject = projectsApi().updateProject({
    config,
    projectId,
    input: {
      jira_mapping_values_json: jiraMappingValues,
    },
  });

  return {
    project: updatedProject,
    pulled,
    jira_mapping_values_json: updatedProject.jira_mapping_values_json,
  };
}

module.exports = {
  pullJiraMappingValues,
};
