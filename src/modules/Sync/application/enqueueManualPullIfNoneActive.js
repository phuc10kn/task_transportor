const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function enqueueManualPullIfNoneActive({ config, input }) {
  return createSyncJobRepository({ config }).enqueueManualPullIfNoneActive(input);
}

module.exports = {
  enqueueManualPullIfNoneActive,
};
