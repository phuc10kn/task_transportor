const { createSyncJobRepository, findActiveIssueJobInDb } = require("../infrastructure/SyncJobRepository");

function hasActiveIssueJob({ config, issueId, jobType }) {
  return createSyncJobRepository({ config }).findActiveIssueJob(issueId, jobType);
}

function hasActiveIssueJobInTransaction({ db, issueId, jobType }) {
  return findActiveIssueJobInDb(db, issueId, jobType);
}

module.exports = {
  hasActiveIssueJob,
  hasActiveIssueJobInTransaction,
};
