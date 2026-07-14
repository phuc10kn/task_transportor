const { AppError } = require("../../../http/errors/AppError");
const ProjectsApi = require("../../Projects/ProjectsApi");
const { createTranslationGlossaryRepository } = require("../infrastructure/TranslationGlossaryRepository");
const {
  assertPositiveInteger,
  normalizeGlossaryInput,
} = require("../support/validateTranslationGlossaryInput");
const { throwGlossaryConflict } = require("./createTranslationGlossaryConcept");

function updateTranslationGlossaryConcept({ config, projectId, conceptId, input, actorId }) {
  const normalizedProjectId = assertPositiveInteger(projectId, "projectId");
  const normalizedConceptId = assertPositiveInteger(conceptId, "conceptId");
  ProjectsApi.getProject({ config, projectId: normalizedProjectId });
  const normalized = normalizeGlossaryInput(input);

  try {
    const updated = createTranslationGlossaryRepository({ config }).update({
      projectId: normalizedProjectId,
      conceptId: normalizedConceptId,
      input: normalized,
      actorId,
    });
    if (!updated) {
      throw new AppError({
        code: "TRANSLATION_GLOSSARY_NOT_FOUND",
        message: "Translation glossary concept was not found for this Project.",
        status: 404,
      });
    }
    return updated;
  } catch (error) {
    throwGlossaryConflict(error);
  }
}

module.exports = {
  updateTranslationGlossaryConcept,
};
