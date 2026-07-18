const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { normalizeProjectInput } = require("../support/validateProjectInput");

function createProject({ config, input, creatorUserId, creatorEmail }) {
  const repository = createProjectRepository({ config });
  let userId = creatorUserId;
  if (!userId && creatorEmail) {
    const user = require("../../Auth/AuthApi").resolveEnabledUserByEmail({ config, email: creatorEmail });
    userId = user && user.id;
  }
  if (!userId) {
    const { AppError } = require("../../../http/errors/AppError");
    throw new AppError({ code: "PROJECT_CREATOR_REQUIRED", message: "An enabled Project creator is required.", status: 422 });
  }
  const project = repository.createForUser(normalizeProjectInput(input), userId);
  if (!project) {
    const { AppError } = require("../../../http/errors/AppError");
    throw new AppError({ code: "PROJECT_CREATOR_NOT_FOUND", message: "Project creator is not an enabled user.", status: 422 });
  }
  return project;
}

module.exports = {
  createProject,
};
