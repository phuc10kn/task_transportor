const { createSyncJobRepository } = require("../infrastructure/SyncJobRepository");

function listJobs({ config, filters }) {
  return createSyncJobRepository({ config }).list(filters);
}

module.exports = {
  listJobs,
};
