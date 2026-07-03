const TranslationApi = require("../../TranslationApi");
const { success } = require("../../../../http/response/envelope");

async function translateIssue(req, res, next) {
  try {
    success(res, await TranslationApi.requestIssueTranslations({
      config: req.app.locals.config,
      issueId: req.params.issueId,
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

async function translateQueueItem(req, res, next) {
  try {
    success(res, await TranslationApi.translateIssueTranslationNow({
      config: req.app.locals.config,
      issueId: req.params.issueId,
      queueId: Number(req.params.queueId),
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  translateIssue,
  translateQueueItem,
};
