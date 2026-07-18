const { AppError } = require("../../../http/errors/AppError");
const AuthApi = require("../../Auth/AuthApi");
const { createProjectRepository } = require("../infrastructure/ProjectRepository");
const { requireActorUserId } = require("./projectAccess");

function requireSystemAdmin({ config, actorUserId }) {
  const actor = AuthApi.getCurrentUser({ config, userId: requireActorUserId(actorUserId) });
  if (actor.system_role !== "system_admin") {
    throw new AppError({ code: "FORBIDDEN", message: "System administrator access is required.", status: 403 });
  }
}

function listProjectOwnerships({ config, actorUserId }) {
  requireSystemAdmin({ config, actorUserId });
  return createProjectRepository({ config }).listOwnerships();
}

function transferProjectOwnership({ config, projectId, actorUserId, newOwnerUserId }) {
  requireSystemAdmin({ config, actorUserId });
  const normalizedProjectId = Number(projectId);
  if (!Number.isSafeInteger(normalizedProjectId) || normalizedProjectId <= 0) {
    throw new AppError({ code: "PROJECT_NOT_FOUND", message: "Project not found.", status: 404 });
  }
  const target = AuthApi.resolveEnabledUserById({ config, userId: newOwnerUserId });
  if (!target) throw new AppError({ code: "USER_NOT_FOUND", message: "The new Project owner must be an enabled user.", status: 404 });
  const result = createProjectRepository({ config }).transferOwnership(normalizedProjectId, target.id);
  if (!result) throw new AppError({ code: "PROJECT_NOT_FOUND", message: "Project not found.", status: 404 });
  return result;
}

module.exports = { listProjectOwnerships, transferProjectOwnership };
