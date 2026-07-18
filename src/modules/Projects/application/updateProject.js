const { AppError } = require("../../../http/errors/AppError");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { normalizeProjectInput } = require("../support/validateProjectInput");

function updateProject({ config, projectId, input, actorUserId }) {
  const repository = createProjectRepository({ config });
  const existing = actorUserId
    ? require("./projectAccess").requireProjectOwner({ config, projectId, userId: actorUserId })
    : repository.findById(projectId);

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
