const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function enqueueJob({ config, input }) {
  return createSyncJobRepository({ config }).enqueue(input);
}

module.exports = {
  enqueueJob,
};
