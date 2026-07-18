const { AppError } = require("../../../http/errors/AppError");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { normalizeProjectInput } = require("../support/validateProjectInput");

const SYSTEM_FIELDS = {
  backlog: "backlog_mapping_values_json",
  jira: "jira_mapping_values_json",
};

function saveProjectMappingValues({ config, projectId, system, systemMappingValues, cisMappingValues }) {
  const normalizedSystem = String(system || "").trim().toLowerCase();
  const systemField = SYSTEM_FIELDS[normalizedSystem];
  if (!systemField) {
    throw new AppError({
      code: "UNSUPPORTED_MAPPING_TARGET_SYSTEM",
      message: `Mapping target system '${normalizedSystem}' is not supported.`,
      status: 422,
      details: { supported_systems: Object.keys(SYSTEM_FIELDS) },
    });
  }

  const repository = createProjectRepository({ config });
  if (!repository.findById(projectId)) {
    throw new AppError({ code: "PROJECT_NOT_FOUND", message: "Project not found.", status: 404 });
  }

  const input = { [systemField]: systemMappingValues };
  if (cisMappingValues !== undefined) input.cis_mapping_values_json = cisMappingValues;
  return repository.update(projectId, normalizeProjectInput(input, { partial: true }));
}

module.exports = { saveProjectMappingValues };
