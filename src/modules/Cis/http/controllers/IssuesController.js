const CisApi = require("../../CisApi");
const TranslationApi = require("../../../Translation/TranslationApi");
const { success } = require("../../../../http/response/envelope");
const { AppError } = require("../../../../http/errors/AppError");

function textFilter(value, field, maxLength = 200) {
  const text = String(value || "").trim();
  if (text.length > maxLength) {
    throw new AppError({ code: "VALIDATION_ERROR", message: `${field} is too long.`, status: 422, details: { field } });
  }
  return text || undefined;
}

function pageFilter(value) {
  const page = value === undefined ? 1 : Number(value);
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new AppError({ code: "VALIDATION_ERROR", message: "page must be a positive integer.", status: 422, details: { field: "page" } });
  }
  return page;
}

function filtersFromRequest(req) {
  return {
    project_id: req.project.id,
    q: textFilter(req.query.q, "q"),
    page: pageFilter(req.query.page),
    page_size: 20,
  };
}

function assertIssueInProject(req) {
  return CisApi.getIssueById({
    config: req.app.locals.config,
    issueId: req.params.issueId,
    projectId: req.project.id,
  });
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
      input: { ...(req.body || {}), project_id: req.project.id },
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    }), 201);
  } catch (error) {
    next(error);
  }
}

async function linkExternalIdentities(req, res, next) {
  try {
    assertIssueInProject(req);
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
    assertIssueInProject(req);
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
    assertIssueInProject(req);
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
    assertIssueInProject(req);
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

async function translate(req, res, next) {
  try {
    assertIssueInProject(req);
    const result = await TranslationApi.requestIssueTranslations({
      config: req.app.locals.config,
      issueId: req.params.issueId,
      targetField: req.body && req.body.target_field || null,
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    });
    success(res, result, result.execution_status === "completed" ? 200 : 202);
  } catch (error) {
    next(error);
  }
}

async function translateQueueItem(req, res, next) {
  try {
    assertIssueInProject(req);
    const result = await TranslationApi.translateIssueTranslationNow({
      config: req.app.locals.config,
      issueId: req.params.issueId,
      queueId: Number(req.params.queueId),
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    });
    success(res, result, result.execution_status === "completed" ? 200 : 202);
  } catch (error) {
    next(error);
  }
}

function history(req, res, next) {
  try {
    assertIssueInProject(req);
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
    assertIssueInProject(req);
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
    assertIssueInProject(req);
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
    assertIssueInProject(req);
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
    assertIssueInProject(req);
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
