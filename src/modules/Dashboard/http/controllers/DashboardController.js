const DashboardApi = require("../../DashboardApi");
const { success } = require("../../../../http/response/envelope");

function summary(req, res, next) {
  try {
    success(res, DashboardApi.getDashboardSummary({
      config: req.app.locals.config,
      projectId: req.project.id,
    }));
  } catch (error) {
    next(error);
  }
}

function alerts(req, res, next) {
  try {
    success(res, DashboardApi.listDashboardAlerts({
      config: req.app.locals.config,
      projectId: req.project.id,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  alerts,
  summary,
};
