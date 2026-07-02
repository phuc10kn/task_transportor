const SyncApi = require("../../SyncApi");
const { success } = require("../../../../http/response/envelope");

function list(req, res, next) {
  try {
    success(res, SyncApi.listJobs({
      config: req.app.locals.config,
      filters: {
        status: req.query.status,
        project_id: req.query.project_id ? Number(req.query.project_id) : undefined,
      },
    }));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    success(
      res,
      SyncApi.enqueueJob({
        config: req.app.locals.config,
        input: {
          ...req.body,
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
    }));
  } catch (error) {
    next(error);
  }
}

function retry(req, res, next) {
  try {
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
