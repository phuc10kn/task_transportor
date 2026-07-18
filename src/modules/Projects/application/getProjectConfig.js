const { AppError } = require("../../../http/errors/AppError");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");

function getProjectConfig({ config, projectId }) {
  const project = createProjectRepository({ config }).findById(projectId);

  if (!project) {
    throw new AppError({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
      status: 404,
    });
  }

  return project;
}

module.exports = {
  getProjectConfig,
};
