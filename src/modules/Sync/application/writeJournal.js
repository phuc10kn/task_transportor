const { createSyncJournalRepository } = require("../infrastructure/SyncJournalRepository");

function writeJournal({ config, input }) {
  return createSyncJournalRepository({ config }).write(input);
}

module.exports = {
  writeJournal,
};
