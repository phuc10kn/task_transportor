const SyncApi = require("../../SyncApi");
const CisApi = require("../../../Cis/CisApi");
const { success } = require("../../../../http/response/envelope");
const { AppError } = require("../../../../http/errors/AppError");

function list(req, res, next) {
  try {
    success(res, SyncApi.listJobs({
      config: req.app.locals.config,
      filters: {
        status: req.query.status,
        project_id: req.project.id,
      },
    }));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    if (req.body && req.body.payload_json && Object.prototype.hasOwnProperty.call(req.body.payload_json, "backlog_issue_snapshot")) {
      throw new AppError({
        code: "SYNC_JOB_PAYLOAD_RESERVED",
        message: "backlog_issue_snapshot is reserved for internal Backlog ingestion.",
        status: 422,
      });
    }
    if (req.body.issue_id) {
      CisApi.getIssueById({ config: req.app.locals.config, issueId: req.body.issue_id, projectId: req.project.id });
    }
    success(
      res,
      SyncApi.enqueueJob({
        config: req.app.locals.config,
        input: {
          ...req.body,
          project_id: req.project.id,
          executed_by: req.user && req.user.id,
          correlation_id: req.correlationId,
        },
      }),
      202
    );
  } catch (error) {
    next(error);
  }
}

function show(req, res, next) {
  try {
    success(res, SyncApi.getJob({
      config: req.app.locals.config,
      jobId: req.params.jobId,
      projectId: req.project && req.project.id,
    }));
  } catch (error) {
    next(error);
  }
}

function retry(req, res, next) {
  try {
    SyncApi.getJob({ config: req.app.locals.config, jobId: req.params.jobId, projectId: req.project.id });
    success(res, SyncApi.retryJob({
      config: req.app.locals.config,
      jobId: req.params.jobId,
      executedBy: req.user && req.user.id,
    }));
  } catch (error) {
    next(error);
  }
}

function cancel(req, res, next) {
  try {
    SyncApi.getJob({ config: req.app.locals.config, jobId: req.params.jobId, projectId: req.project.id });
    success(res, SyncApi.cancelJob({
      config: req.app.locals.config,
      jobId: req.params.jobId,
      executedBy: req.user && req.user.id,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  cancel,
  create,
  list,
  retry,
  show,
};
