const { createDashboardRepository } = require("../infrastructure/DashboardRepository");

function getDashboardSummary({ config, projectId }) {
  return createDashboardRepository({ config }).summary(projectId);
}

module.exports = {
  getDashboardSummary,
};
