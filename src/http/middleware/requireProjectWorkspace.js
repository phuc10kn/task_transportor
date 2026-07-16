const { AppError } = require("../errors/AppError");
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

    const project = ProjectsApi.getProject({ config: req.app.locals.config, projectId });
    if (project.enabled === false) {
      throw new AppError({ code: "PROJECT_DISABLED", message: "Project is disabled.", status: 409 });
    }

    assertMatchingScope(req.query && req.query.project_id, projectId, "query");
    assertMatchingScope(req.body && req.body.project_id, projectId, "body");
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireProjectWorkspace };
