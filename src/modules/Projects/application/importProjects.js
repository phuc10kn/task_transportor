const { createProject } = require("./createProject");

function importProjects({ config, projects, creatorEmail }) {
  if (!Array.isArray(projects)) {
    throw new Error("Project seed must be an array.");
  }

  if (!creatorEmail) throw new Error("creator_email is required for Project import.");
  return projects.map((project) => createProject({ config, input: project, creatorEmail }));
}

module.exports = {
  importProjects,
};
