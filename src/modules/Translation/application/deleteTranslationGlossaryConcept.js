const { AppError } = require("../../../http/errors/AppError");
const ProjectsApi = require("../../Projects/ProjectsApi");
const { createTranslationGlossaryRepository } = require("../infrastructure/TranslationGlossaryRepository");
const { assertPositiveInteger } = require("../support/validateTranslationGlossaryInput");

function deleteTranslationGlossaryConcept({ config, projectId, conceptId }) {
  const normalizedProjectId = assertPositiveInteger(projectId, "projectId");
  const normalizedConceptId = assertPositiveInteger(conceptId, "conceptId");
  ProjectsApi.getProject({ config, projectId: normalizedProjectId });
  const deleted = createTranslationGlossaryRepository({ config }).delete({
    projectId: normalizedProjectId,
    conceptId: normalizedConceptId,
  });
  if (!deleted) {
    throw new AppError({
      code: "TRANSLATION_GLOSSARY_NOT_FOUND",
      message: "Translation glossary concept was not found for this Project.",
      status: 404,
    });
  }
  return { id: normalizedConceptId, deleted: true };
}

module.exports = {
  deleteTranslationGlossaryConcept,
};
