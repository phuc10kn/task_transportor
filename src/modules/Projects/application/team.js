const { AppError } = require("../../../http/errors/AppError");
const AuthApi = require("../../Auth/AuthApi");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { getProjectForUser, requireTeamLead } = require("./projectAccess");

function getProjectTeam({ config, projectId, actorUserId }) {
  getProjectForUser({ config, projectId, userId: actorUserId });
  return createProjectRepository({ config }).getTeam(projectId);
}
function validRole(role) {
  if (!["lead", "member"].includes(role)) throw new AppError({ code: "INVALID_TEAM_ROLE", message: "Team role must be lead or member.", status: 422 });
}
function addProjectTeamMember({ config, projectId, actorUserId, input }) {
  requireTeamLead({ config, projectId, userId: actorUserId });
  validRole(input.role || "member");
  const user = AuthApi.resolveEnabledUserByEmail({ config, email: input.email });
  if (!user) throw new AppError({ code: "USER_NOT_FOUND", message: "No enabled user has this exact email.", status: 404 });
  const result = createProjectRepository({ config }).addMember(projectId, user.id, input.role || "member");
  if (result.duplicate) throw new AppError({ code: "TEAM_MEMBER_EXISTS", message: "User is already a team member.", status: 409 });
  return result;
}
function updateProjectTeamMember({ config, projectId, actorUserId, memberUserId, input }) {
  requireTeamLead({ config, projectId, userId: actorUserId });
  validRole(input.role);
  const result = createProjectRepository({ config }).updateMemberRole(projectId, memberUserId, input.role);
  if (result.ownerProtected) throw new AppError({ code: "PROJECT_OWNER_PROTECTED", message: "Project owner must remain team lead.", status: 409 });
  if (result.missing) throw new AppError({ code: "TEAM_MEMBER_NOT_FOUND", message: "Team member not found.", status: 404 });
  return getProjectTeam({ config, projectId, actorUserId });
}
function removeProjectTeamMember({ config, projectId, actorUserId, memberUserId }) {
  requireTeamLead({ config, projectId, userId: actorUserId });
  const result = createProjectRepository({ config }).removeMember(projectId, memberUserId);
  if (result.ownerProtected) throw new AppError({ code: "PROJECT_OWNER_PROTECTED", message: "Project owner cannot be removed.", status: 409 });
  if (!result.removed) throw new AppError({ code: "TEAM_MEMBER_NOT_FOUND", message: "Team member not found.", status: 404 });
  return getProjectTeam({ config, projectId, actorUserId });
}

module.exports = { addProjectTeamMember, getProjectTeam, removeProjectTeamMember, updateProjectTeamMember };

