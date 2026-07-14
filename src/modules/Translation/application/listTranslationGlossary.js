const ProjectsApi = require("../../Projects/ProjectsApi");
const { createTranslationGlossaryRepository } = require("../infrastructure/TranslationGlossaryRepository");
const { assertPositiveInteger } = require("../support/validateTranslationGlossaryInput");

function listTranslationGlossary({ config, projectId, groupKey, query }) {
  const normalizedProjectId = assertPositiveInteger(projectId, "projectId");
  ProjectsApi.getProject({ config, projectId: normalizedProjectId });
  return {
    project_id: normalizedProjectId,
    concepts: createTranslationGlossaryRepository({ config }).list({
      projectId: normalizedProjectId,
      groupKey,
      query,
    }),
  };
}

module.exports = {
  listTranslationGlossary,
};
