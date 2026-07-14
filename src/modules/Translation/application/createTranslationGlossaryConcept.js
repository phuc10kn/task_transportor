const { AppError } = require("../../../http/errors/AppError");
const ProjectsApi = require("../../Projects/ProjectsApi");
const { createTranslationGlossaryRepository } = require("../infrastructure/TranslationGlossaryRepository");
const {
  assertPositiveInteger,
  normalizeGlossaryInput,
} = require("../support/validateTranslationGlossaryInput");

function throwGlossaryConflict(error) {
  const message = String(error && error.message || "");
  if (message.includes("TRANSLATION_GLOSSARY_TERM_CONFLICT")) {
    throw new AppError({
      code: "TRANSLATION_GLOSSARY_CONFLICT",
      message: "A normalized term is already used by another concept in this project and language.",
      status: 409,
      details: { field: "terms" },
    });
  }
  if (error && (error.code === "SQLITE_CONSTRAINT_UNIQUE" || message.includes("translation_glossary_concepts.project_id"))) {
    if (message.includes("translation_glossary_terms")) {
      throw new AppError({
        code: "TRANSLATION_GLOSSARY_CONFLICT",
        message: "A normalized term is already used by this concept and language.",
        status: 409,
        details: { field: "terms" },
      });
    }
    throw new AppError({
      code: "TRANSLATION_GLOSSARY_CONFLICT",
      message: "A glossary concept with the same Project, group and concept key already exists.",
      status: 409,
      details: { field: "concept_key" },
    });
  }
  throw error;
}

function createTranslationGlossaryConcept({ config, projectId, input, actorId }) {
  const normalizedProjectId = assertPositiveInteger(projectId, "projectId");
  ProjectsApi.getProject({ config, projectId: normalizedProjectId });
  const normalized = normalizeGlossaryInput(input);

  try {
    return createTranslationGlossaryRepository({ config }).create({
      projectId: normalizedProjectId,
      input: normalized,
      actorId,
    });
  } catch (error) {
    throwGlossaryConflict(error);
  }
}

module.exports = {
  createTranslationGlossaryConcept,
  throwGlossaryConflict,
};
