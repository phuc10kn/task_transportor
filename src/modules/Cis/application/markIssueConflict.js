const { markIssueSyncStatus } = require("./markIssueSyncStatus");

function markIssueConflict({ config, issueId }) {
  return markIssueSyncStatus({
    config,
    issueId,
    status: "conflict",
  });
}

module.exports = {
  markIssueConflict,
};
