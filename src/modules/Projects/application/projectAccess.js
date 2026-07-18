const { AppError } = require("../../../http/errors/AppError");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");

function requireActorUserId(actorUserId) {
  const parsed = Number(actorUserId);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new AppError({ code: "AUTH_REQUIRED", message: "Authentication is required.", status: 401 });
  }
  return parsed;
}

function getProjectForUser({ config, projectId, actorUserId }) {
  const project = createProjectRepository({ config }).findByIdForUser(projectId, requireActorUserId(actorUserId));
  if (!project) throw new AppError({ code: "PROJECT_NOT_FOUND", message: "Project not found.", status: 404 });
  return project;
}

function requireProjectOwner(args) {
  const project = getProjectForUser(args);
  if (!project.access.is_owner) throw new AppError({ code: "PROJECT_OWNER_REQUIRED", message: "Project owner access is required.", status: 403 });
  return project;
}

function requireTeamLead(args) {
  const project = getProjectForUser(args);
  if (project.access.team_role !== "lead") throw new AppError({ code: "TEAM_LEAD_REQUIRED", message: "Team lead access is required.", status: 403 });
  return project;
}

module.exports = { getProjectForUser, requireActorUserId, requireProjectOwner, requireTeamLead };
