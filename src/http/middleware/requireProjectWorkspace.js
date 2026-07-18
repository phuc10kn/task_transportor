const { AppError } = require("../errors/AppError");
const { updateTraceContext } = require("../../infrastructure/observability/traceContext");
const ProjectsApi = require("../../modules/Projects/ProjectsApi");

function positiveInteger(value) {
  const text = String(value === undefined || value === null ? "" : value).trim();
  const parsed = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function assertMatchingScope(value, projectId, source) {
  if (value === undefined) return;
  if (positiveInteger(value) !== projectId) {
    throw new AppError({
      code: "PROJECT_SCOPE_MISMATCH",
      message: `${source}.project_id must match the Project in the request path.`,
      status: 422,
      details: { field: "project_id", source },
    });
  }
}

function requireProjectWorkspace(req, res, next) {
  try {
    const projectId = positiveInteger(req.params.projectId);
    if (!projectId) {
      throw new AppError({ code: "PROJECT_NOT_FOUND", message: "Project not found.", status: 404 });
    }

    const project = ProjectsApi.getProjectForUser({ config: req.app.locals.config, projectId, actorUserId: req.user.id });
    if (project.enabled === false) {
      throw new AppError({ code: "PROJECT_DISABLED", message: "Project is disabled.", status: 409 });
    }

    assertMatchingScope(req.query && req.query.project_id, projectId, "query");
    assertMatchingScope(req.body && req.body.project_id, projectId, "body");
    req.project = project;
    req.projectAccess = project.access;
    updateTraceContext({ project_id: projectId });
    if (req.app.locals.logger) {
      req.app.locals.logger.info({
        event: "request.resolved",
        ...(req.requestId ? { request_id: req.requestId } : {}),
        ...(req.user && req.user.id ? { user_id: req.user.id } : {}),
        project_id: projectId,
        action: `${req.method} ${req.originalUrl.split("?")[0]}`,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireProjectWorkspace };
