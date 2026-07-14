const { createSyncJournalRepository, insertJournal } = require("../infrastructure/SyncJournalRepository");

function writeJournal({ config, input }) {
  return createSyncJournalRepository({ config }).write(input);
}

function writeJournalInTransaction({ db, input }) {
  return insertJournal(db, input);
}

module.exports = {
  writeJournal,
  writeJournalInTransaction,
};
