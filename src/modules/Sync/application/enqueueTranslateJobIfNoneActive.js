const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function enqueueTranslateJobIfNoneActive({ config, input }) {
  return createSyncJobRepository({ config }).enqueueTranslateJobIfNoneActive(input);
}

module.exports = {
  enqueueTranslateJobIfNoneActive,
};
