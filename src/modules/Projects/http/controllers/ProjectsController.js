const ProjectsApi = require("../../ProjectsApi");
const { success } = require("../../../../http/response/envelope");

function list(req, res, next) {
  try {
    success(res, ProjectsApi.listProjects({ config: req.app.locals.config, userId: req.user.id }));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    success(
      res,
      ProjectsApi.createProject({
        config: req.app.locals.config,
        input: req.body,
        creatorUserId: req.user.id,
      }),
      201
    );
  } catch (error) {
    next(error);
  }
}

function show(req, res, next) {
  try {
    success(
      res,
      ProjectsApi.getProjectForUser({
        config: req.app.locals.config,
        projectId: Number(req.params.projectId),
        userId: req.user.id,
      })
    );
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    success(
      res,
      ProjectsApi.updateProject({
        config: req.app.locals.config,
        projectId: Number(req.params.projectId),
        input: req.body,
        actorUserId: req.user.id,
      })
    );
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    success(
      res,
      ProjectsApi.deleteProject({
        config: req.app.locals.config,
        projectId: Number(req.params.projectId),
        actorUserId: req.user.id,
      })
    );
  } catch (error) {
    next(error);
  }
}

function enableSync(req, res, next) {
  try {
    ProjectsApi.requireProjectOwner({ config: req.app.locals.config, projectId: Number(req.params.projectId), userId: req.user.id });
    success(
      res,
      ProjectsApi.setProjectSyncEnabled({
        config: req.app.locals.config,
        projectId: Number(req.params.projectId),
        enabled: true,
      })
    );
  } catch (error) {
    next(error);
  }
}

function disableSync(req, res, next) {
  try {
    ProjectsApi.requireProjectOwner({ config: req.app.locals.config, projectId: Number(req.params.projectId), userId: req.user.id });
    success(
      res,
      ProjectsApi.setProjectSyncEnabled({
        config: req.app.locals.config,
        projectId: Number(req.params.projectId),
        enabled: false,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function syncCisMappingValues(req, res, next) {
  try {
    ProjectsApi.requireProjectOwner({ config: req.app.locals.config, projectId: Number(req.params.projectId), userId: req.user.id });
    const result = await ProjectsApi.syncCisMappingValuesFromTarget({
      config: req.app.locals.config,
      projectId: Number(req.params.projectId),
      targetSystem: req.body && req.body.target_system,
    });

    success(res, result);
  } catch (error) {
    next(error);
  }
}

function team(req, res, next) {
  try { success(res, ProjectsApi.getProjectTeam({ config: req.app.locals.config, projectId: Number(req.params.projectId), actorUserId: req.user.id })); } catch (error) { next(error); }
}
function addTeamMember(req, res, next) {
  try { success(res, ProjectsApi.addProjectTeamMember({ config: req.app.locals.config, projectId: Number(req.params.projectId), actorUserId: req.user.id, input: req.body || {} }), 201); } catch (error) { next(error); }
}
function updateTeamMember(req, res, next) {
  try { success(res, ProjectsApi.updateProjectTeamMember({ config: req.app.locals.config, projectId: Number(req.params.projectId), actorUserId: req.user.id, memberUserId: Number(req.params.userId), input: req.body || {} })); } catch (error) { next(error); }
}
function removeTeamMember(req, res, next) {
  try { success(res, ProjectsApi.removeProjectTeamMember({ config: req.app.locals.config, projectId: Number(req.params.projectId), actorUserId: req.user.id, memberUserId: Number(req.params.userId) })); } catch (error) { next(error); }
}

module.exports = {
  create,
  addTeamMember,
  disableSync,
  enableSync,
  list,
  remove,
  removeTeamMember,
  show,
  syncCisMappingValues,
  team,
  update,
  updateTeamMember,
};
