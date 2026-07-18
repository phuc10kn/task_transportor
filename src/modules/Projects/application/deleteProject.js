const { AppError } = require("../../../http/errors/AppError");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");

function deleteProject({ config, projectId, actorUserId }) {
  const repository = createProjectRepository({ config });
  if (actorUserId) require("./projectAccess").requireProjectOwner({ config, projectId, userId: actorUserId });
  const deleted = repository.removeWithTeam(projectId);

  if (!deleted) {
    throw new AppError({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
      status: 404,
    });
  }

  return { deleted: true };
}

module.exports = {
  deleteProject,
};
