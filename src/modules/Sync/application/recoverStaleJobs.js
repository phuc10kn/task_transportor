const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function recoverStaleJobs({ config, workerId, lockTimeoutSeconds }) {
  return createSyncJobRepository({ config }).recoverStale({
    workerId: workerId || config.worker.id,
    lockTimeoutSeconds: lockTimeoutSeconds || config.worker.lockTimeoutSeconds,
  });
}

module.exports = {
  recoverStaleJobs,
};
