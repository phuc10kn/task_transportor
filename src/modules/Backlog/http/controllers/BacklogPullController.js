const BacklogApi = require("../../BacklogApi");
const { success } = require("../../../../http/response/envelope");

function actionReadiness(req, res, next) {
  try {
    success(res, BacklogApi.getIssueActionReadiness({ config: req.app.locals.config, projectId: req.params.projectId }));
  } catch (error) { next(error); }
}

async function candidates(req, res, next) {
  try {
    success(res, await BacklogApi.listIssueCandidates({
      config: req.app.locals.config,
      projectId: req.params.projectId,
      filters: req.query,
    }));
  } catch (error) { next(error); }
}

async function candidateFilterOptions(req, res, next) {
  try {
    success(res, await BacklogApi.listIssueCandidateFilterOptions({
      config: req.app.locals.config,
      projectId: req.params.projectId,
    }));
  } catch (error) { next(error); }
}

async function syncCandidateToCis(req, res, next) {
  try {
    const hasTranslationFlag = req.body && Object.prototype.hasOwnProperty.call(req.body, "with_translation");
    const hasJiraFlag = req.body && Object.prototype.hasOwnProperty.call(req.body, "push_to_jira");
    const result = await BacklogApi.syncCandidateToCis({
      config: req.app.locals.config,
      projectId: req.params.projectId,
      backlogIssueKey: req.params.backlogIssueKey,
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
      withTranslation: hasTranslationFlag ? req.body.with_translation : undefined,
      pushToJira: hasJiraFlag ? req.body.push_to_jira : undefined,
    });
    success(res, result, result.outcome === "queued" ? 202 : 200);
  } catch (error) { next(error); }
}

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
  actionReadiness,
  candidateFilterOptions,
  candidates,
  pullMappingValues,
  pullIssue,
  pullProject,
  syncCandidateToCis,
};
