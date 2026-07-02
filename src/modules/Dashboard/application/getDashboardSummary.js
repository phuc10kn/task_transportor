const { createDashboardRepository } = require("../infrastructure/DashboardRepository");

function getDashboardSummary({ config }) {
  return createDashboardRepository({ config }).summary();
}

module.exports = {
  getDashboardSummary,
};
