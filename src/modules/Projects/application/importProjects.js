const { createProject } = require("./createProject");

function importProjects({ config, projects }) {
  if (!Array.isArray(projects)) {
    throw new Error("Project seed must be an array.");
  }

  return projects.map((project) => createProject({ config, input: project }));
}

module.exports = {
  importProjects,
};
