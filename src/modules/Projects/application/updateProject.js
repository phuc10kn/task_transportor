const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { normalizeProjectInput } = require("../support/validateProjectInput");
const { requireProjectOwner } = require("./projectAccess");

function updateProject({ config, projectId, input, actorUserId }) {
  const repository = createProjectRepository({ config });
  requireProjectOwner({ config, projectId, actorUserId });

  return repository.update(projectId, normalizeProjectInput(input, { partial: true }));
}

module.exports = {
  updateProject,
};
