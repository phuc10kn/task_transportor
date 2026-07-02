const { createProjectRepository } = require("../infrastructure/ProjectRepository");

function listProjects({ config }) {
  return createProjectRepository({ config }).list();
}

module.exports = {
  listProjects,
};
