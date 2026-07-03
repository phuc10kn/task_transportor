const BacklogApi = require("../../BacklogApi");
const { success } = require("../../../../http/response/envelope");

async function pullIssue(req, res, next) {
  try {
    const result = await BacklogApi.pullIssueNow({
      config: req.app.locals.config,
      projectId: req.params.projectId,
      backlogIssueKey: req.params.backlogIssueKey,
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    });

    success(res, result, 202);
  } catch (error) {
    next(error);
  }
}

async function pullProject(req, res, next) {
  try {
    const result = await BacklogApi.pullProject({
      config: req.app.locals.config,
      projectId: req.params.projectId,
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    });

    success(res, result, 202);
  } catch (error) {
    next(error);
  }
}

async function pullMappingValues(req, res, next) {
  try {
    const result = await BacklogApi.pullBacklogMappingValues({
      config: req.app.locals.config,
      projectId: req.params.projectId,
    });

    success(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  pullMappingValues,
  pullIssue,
  pullProject,
};
