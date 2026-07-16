const { success } = require("../../../../http/response/envelope");
const TranslationApi = require("../../TranslationApi");

function assertQueueItemInProject(req) {
  return TranslationApi.getTranslationQueueItem({
    config: req.app.locals.config,
    queueId: req.params.queueId,
    projectId: req.project.id,
  });
}

function list(req, res, next) {
  try {
    success(res, TranslationApi.listTranslationQueue({
      config: req.app.locals.config,
      filters: {
        project_id: req.project.id,
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
    success(res, assertQueueItemInProject(req));
  } catch (error) {
    next(error);
  }
}

function approve(req, res, next) {
  try {
    assertQueueItemInProject(req);
    success(res, TranslationApi.approveTranslation({
      config: req.app.locals.config,
      queueId: req.params.queueId,
      reviewedBy: req.user && req.user.id,
      reviewNotes: req.body && req.body.review_notes,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

function reject(req, res, next) {
  try {
    assertQueueItemInProject(req);
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
    assertQueueItemInProject(req);
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

function saveDraft(req, res, next) {
  try {
    assertQueueItemInProject(req);
    success(res, TranslationApi.saveTranslationDraft({
      config: req.app.locals.config,
      queueId: req.params.queueId,
      draftText: req.body.draft_text,
      editedBy: req.user && req.user.id,
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
  reject,
  retranslate,
  saveDraft,
  show,
};
