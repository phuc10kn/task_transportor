const { createDashboardRepository } = require("../infrastructure/DashboardRepository");

function listDashboardAlerts({ config }) {
  return createDashboardRepository({ config }).alerts();
}

module.exports = {
  listDashboardAlerts,
};
