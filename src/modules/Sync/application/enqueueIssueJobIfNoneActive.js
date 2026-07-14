const { createSyncJobRepository, findActiveIssueJobInDb, insertJobInDb } = require("../infrastructure/SyncJobRepository");

function enqueueIssueJobIfNoneActive({ config, input }) {
  return createSyncJobRepository({ config }).enqueueIssueJobIfNoneActive(input);
}

function enqueueIssueJobIfNoneActiveInTransaction({ db, input }) {
  const existing = findActiveIssueJobInDb(db, input.issue_id, input.job_type);
  return existing
    ? { job: existing, reused: true }
    : { job: insertJobInDb(db, input), reused: false };
}

module.exports = { enqueueIssueJobIfNoneActive, enqueueIssueJobIfNoneActiveInTransaction };
