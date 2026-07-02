function runInTransaction(db, callback) {
  return db.transaction(callback)();
}

function createTransactionRunner(db) {
  return function run(callback) {
    return db.transaction(callback)();
  };
}

module.exports = {
  createTransactionRunner,
  runInTransaction,
};
