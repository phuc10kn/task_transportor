const { DEFAULT_PULL_FILTER } = require("../../Projects/support/defaultProjectConfig");

function parseScheduledPullFilter(project) {
  return {
    ...DEFAULT_PULL_FILTER,
    ...(project.scheduled_pull_filter_json || {}),
  };
}

module.exports = {
  parseScheduledPullFilter,
};
