const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { normalizeProjectInput } = require("../support/validateProjectInput");

function createProject({ config, input }) {
  const repository = createProjectRepository({ config });

  return repository.create(normalizeProjectInput(input));
}

module.exports = {
  createProject,
};
