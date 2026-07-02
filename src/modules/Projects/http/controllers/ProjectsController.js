const ProjectsApi = require("../../ProjectsApi");
const { success } = require("../../../../http/response/envelope");

function list(req, res, next) {
  try {
    success(res, ProjectsApi.listProjects({ config: req.app.locals.config }));
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
      ProjectsApi.getProject({
        config: req.app.locals.config,
        projectId: Number(req.params.projectId),
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
      })
    );
  } catch (error) {
    next(error);
  }
}

function enableSync(req, res, next) {
  try {
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

module.exports = {
  create,
  disableSync,
  enableSync,
  list,
  remove,
  show,
  syncCisMappingValues,
  update,
};
