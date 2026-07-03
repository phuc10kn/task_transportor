const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function cancelTranslateJobsForQueueIds({
  config,
  queueIds,
  executedBy = null,
  trigger = "system",
  correlationId = null,
}) {
  return createSyncJobRepository({ config }).cancelTranslateJobsForQueueIds(queueIds, {
    executedBy,
    trigger,
    correlationId,
  });
}

module.exports = {
  cancelTranslateJobsForQueueIds,
};
