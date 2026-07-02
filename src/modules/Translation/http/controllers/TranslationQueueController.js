const { success } = require("../../../../http/response/envelope");
const TranslationApi = require("../../TranslationApi");

function list(req, res, next) {
  try {
    success(res, TranslationApi.listTranslationQueue({
      config: req.app.locals.config,
      filters: {
        project_id: req.query.project_id ? Number(req.query.project_id) : undefined,
        issue_id: req.query.issue_id,
        review_status: req.query.review_status,
      },
    }));
  } catch (error) {
    next(error);
  }
}

function show(req, res, next) {
  try {
    success(res, TranslationApi.getTranslationQueueItem({
      config: req.app.locals.config,
      queueId: req.params.queueId,
    }));
  } catch (error) {
    next(error);
  }
}

function approve(req, res, next) {
  try {
    success(res, TranslationApi.approveTranslation({
      config: req.app.locals.config,
      queueId: req.params.queueId,
      reviewedBy: req.user && req.user.id,
      reviewNotes: req.body.review_notes,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

function reject(req, res, next) {
  try {
    success(res, TranslationApi.rejectTranslation({
      config: req.app.locals.config,
      queueId: req.params.queueId,
      reviewedBy: req.user && req.user.id,
      reviewNotes: req.body.review_notes,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

function retranslate(req, res, next) {
  try {
    success(res, TranslationApi.retranslateTranslation({
      config: req.app.locals.config,
      queueId: req.params.queueId,
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    }), 202);
  } catch (error) {
    next(error);
  }
}

function manualEdit(req, res, next) {
  try {
    success(res, TranslationApi.manualEditTranslation({
      config: req.app.locals.config,
      queueId: req.params.queueId,
      reviewedText: req.body.reviewed_text,
      reviewedBy: req.user && req.user.id,
      reviewNotes: req.body.review_notes,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  approve,
  list,
  manualEdit,
  reject,
  retranslate,
  show,
};
