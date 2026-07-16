const { createDashboardRepository } = require("../infrastructure/DashboardRepository");

function listDashboardAlerts({ config, projectId }) {
  return createDashboardRepository({ config }).alerts(projectId);
}

module.exports = {
  listDashboardAlerts,
};
