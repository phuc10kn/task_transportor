const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");
const { runLockedJob } = require("./runJobNow");

async function runWorkerOnce({ config, workerId }) {
  const repository = createSyncJobRepository({ config });
  const job = repository.lockNext({
    workerId: workerId || config.worker.id,
  });

  if (!job) {
    return {
      processed: false,
      job: null,
    };
  }

  return runLockedJob({ config, job, repository });
}

module.exports = {
  runWorkerOnce,
};
