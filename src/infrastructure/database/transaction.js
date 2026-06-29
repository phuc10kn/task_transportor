function runInTransaction(db, callback) {
  return db.transaction(callback)();
}

module.exports = {
  runInTransaction,
};
