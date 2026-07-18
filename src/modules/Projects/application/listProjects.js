const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { requireActorUserId } = require("./projectAccess");

function listProjectsForUser({ config, actorUserId }) {
  return createProjectRepository({ config }).listForUser(requireActorUserId(actorUserId));
}

function listProjectsForScheduledPull({ config }) {
  return createProjectRepository({ config }).list();
}

module.exports = {
  listProjectsForScheduledPull,
  listProjectsForUser,
};
