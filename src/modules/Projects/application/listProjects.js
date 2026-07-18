const { createProjectRepository } = require("../infrastructure/ProjectRepository");

function listProjects({ config, userId }) {
  return userId ? createProjectRepository({ config }).listForUser(userId) : createProjectRepository({ config }).list();
}

module.exports = {
  listProjects,
};
