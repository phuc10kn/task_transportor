const { success } = require("../../../../http/response/envelope");
const AnomalyApi = require("../../AnomalyApi");

function filtersFromQuery(query) {
  return {
    project_id: query.project_id ? Number(query.project_id) : undefined,
    issue_id: query.issue_id,
    anomaly_type: query.anomaly_type,
    severity: query.severity,
    status: query.status,
  };
}

function list(req, res, next) {
  try {
    success(res, AnomalyApi.listAnomalies({
      config: req.app.locals.config,
      filters: filtersFromQuery(req.query),
    }));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    success(res, AnomalyApi.createAnomaly({
      config: req.app.locals.config,
      input: req.body,
    }), 201);
  } catch (error) {
    next(error);
  }
}

function show(req, res, next) {
  try {
    success(res, AnomalyApi.getAnomaly({
      config: req.app.locals.config,
      anomalyId: req.params.anomalyId,
    }));
  } catch (error) {
    next(error);
  }
}

function ignore(req, res, next) {
  try {
    success(res, AnomalyApi.ignoreAnomaly({
      config: req.app.locals.config,
      anomalyId: req.params.anomalyId,
      resolvedBy: req.user && req.user.id,
    }));
  } catch (error) {
    next(error);
  }
}

function resolve(req, res, next) {
  try {
    success(res, AnomalyApi.resolveAnomaly({
      config: req.app.locals.config,
      anomalyId: req.params.anomalyId,
      resolvedBy: req.user && req.user.id,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  ignore,
  list,
  resolve,
  show,
};
