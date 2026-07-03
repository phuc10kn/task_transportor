const { DEFAULT_PULL_FILTER } = require("../../../shared/pullDefaults");

function parseScheduledPullFilter(project) {
  return {
    ...DEFAULT_PULL_FILTER,
    ...(project.scheduled_pull_filter_json || {}),
  };
}

module.exports = {
  parseScheduledPullFilter,
};
