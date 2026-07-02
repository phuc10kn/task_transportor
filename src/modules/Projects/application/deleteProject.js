const { AppError } = require("../../../http/errors/AppError");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");

function deleteProject({ config, projectId }) {
  const repository = createProjectRepository({ config });
  const deleted = repository.remove(projectId);

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
