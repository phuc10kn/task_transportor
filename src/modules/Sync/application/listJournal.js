const { createSyncJournalRepository } = require("../infrastructure/SyncJournalRepository");

function listJournal({ config, filters }) {
  return createSyncJournalRepository({ config }).list(filters);
}

module.exports = {
  listJournal,
};
