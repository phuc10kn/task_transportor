const { AppError } = require("../../../http/errors/AppError");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { normalizeProjectInput } = require("../support/validateProjectInput");

function updateProject({ config, projectId, input }) {
  const repository = createProjectRepository({ config });
  const existing = repository.findById(projectId);

  if (!existing) {
    throw new AppError({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
      status: 404,
    });
  }

  return repository.update(projectId, normalizeProjectInput(input, { partial: true }));
}

module.exports = {
  updateProject,
};
