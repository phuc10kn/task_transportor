const { success } = require("../../../../http/response/envelope");
const AnomalyApi = require("../../AnomalyApi");
const CisApi = require("../../../Cis/CisApi");

function filtersFromQuery(query, projectId) {
  return {
    project_id: projectId,
    issue_id: query.issue_id,
    anomaly_type: query.anomaly_type,
    severity: query.severity,
    status: query.status,
  };
}

function assertAnomalyInProject(req) {
  return AnomalyApi.getAnomaly({
    config: req.app.locals.config,
    anomalyId: req.params.anomalyId,
    projectId: req.project.id,
  });
}

function list(req, res, next) {
  try {
    success(res, AnomalyApi.listAnomalies({
      config: req.app.locals.config,
      filters: filtersFromQuery(req.query, req.project.id),
    }));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    if (req.body.issue_id) {
      CisApi.getIssueById({ config: req.app.locals.config, issueId: req.body.issue_id, projectId: req.project.id });
    }
    success(res, AnomalyApi.createAnomaly({
      config: req.app.locals.config,
      input: { ...req.body, project_id: req.project.id },
    }), 201);
  } catch (error) {
    next(error);
  }
}

function show(req, res, next) {
  try {
    success(res, assertAnomalyInProject(req));
  } catch (error) {
    next(error);
  }
}

function ignore(req, res, next) {
  try {
    assertAnomalyInProject(req);
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
    assertAnomalyInProject(req);
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
