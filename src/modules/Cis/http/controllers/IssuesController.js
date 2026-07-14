const CisApi = require("../../CisApi");
const TranslationApi = require("../../../Translation/TranslationApi");
const { success } = require("../../../../http/response/envelope");

function filtersFromRequest(req) {
  return {
    project_id: req.params.projectId ? Number(req.params.projectId) : (
      req.query.project_id ? Number(req.query.project_id) : undefined
    ),
    status: req.query.status,
    q: req.query.q,
  };
}

function list(req, res, next) {
  try {
    success(res, CisApi.listIssues({
      config: req.app.locals.config,
      filters: filtersFromRequest(req),
    }));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    success(res, CisApi.createManualIssue({
      config: req.app.locals.config,
      input: req.body || {},
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    }), 201);
  } catch (error) {
    next(error);
  }
}

async function linkExternalIdentities(req, res, next) {
  try {
    success(res, await CisApi.linkExternalIdentities({
      config: req.app.locals.config,
      issueId: req.params.issueId,
      input: req.body || {},
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

function show(req, res, next) {
  try {
    success(res, CisApi.getIssueDetail({
      config: req.app.locals.config,
      issueId: req.params.issueId,
    }));
  } catch (error) {
    next(error);
  }
}

function editor(req, res, next) {
  try {
    success(res, CisApi.getIssueEditor({
      config: req.app.locals.config,
      issueId: req.params.issueId,
    }));
  } catch (error) {
    next(error);
  }
}

function updateCanonical(req, res, next) {
  try {
    success(res, CisApi.updateCanonicalIssue({
      config: req.app.locals.config,
      issueId: req.params.issueId,
      payload: req.body || {},
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

// TODO compatibility wrapper: Translation owns this use case.
// Route kept for backward-compatible URL only.
async function translate(req, res, next) {
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

// TODO compatibility wrapper: Translation owns this use case.
// Route kept for backward-compatible URL only.
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

function history(req, res, next) {
  try {
    success(res, CisApi.listIssueHistory({
      config: req.app.locals.config,
      issueId: req.params.issueId,
    }));
  } catch (error) {
    next(error);
  }
}

function worklogs(req, res, next) {
  try {
    success(res, CisApi.listIssueWorklogs({
      config: req.app.locals.config,
      issueId: req.params.issueId,
    }));
  } catch (error) {
    next(error);
  }
}

function attachments(req, res, next) {
  try {
    const detail = CisApi.getIssueDetail({
      config: req.app.locals.config,
      issueId: req.params.issueId,
    });
    success(res, detail.attachments);
  } catch (error) {
    next(error);
  }
}

function forceApprove(req, res, next) {
  try {
    success(res, CisApi.forceApproveIssue({
      config: req.app.locals.config,
      issueId: req.params.issueId,
    }));
  } catch (error) {
    next(error);
  }
}

function markDuplicate(req, res, next) {
  try {
    success(res, CisApi.markDuplicateIssue({
      config: req.app.locals.config,
      issueId: req.params.issueId,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  attachments,
  create,
  editor,
  forceApprove,
  history,
  list,
  linkExternalIdentities,
  markDuplicate,
  show,
  translate,
  translateQueueItem,
  updateCanonical,
  worklogs,
};
