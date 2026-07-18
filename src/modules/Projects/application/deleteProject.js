const { AppError } = require("../../../http/errors/AppError");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { requireProjectOwner } = require("./projectAccess");

function deleteProject({ config, projectId, actorUserId }) {
  const repository = createProjectRepository({ config });
  requireProjectOwner({ config, projectId, actorUserId });
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
