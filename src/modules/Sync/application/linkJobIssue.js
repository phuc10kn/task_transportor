const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function linkJobIssue({ config, jobId, issueId }) {
  return createSyncJobRepository({ config }).linkIssue(jobId, issueId);
}

module.exports = {
  linkJobIssue,
};
