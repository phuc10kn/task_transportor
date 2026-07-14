function runInTransaction(db, callback) {
  return db.transaction(callback)();
}

function createTransactionRunner(db) {
  return function run(callback) {
    return db.transaction(callback)();
  };
}

function isBusyError(error) {
  return ["SQLITE_BUSY", "SQLITE_BUSY_SNAPSHOT", "SQLITE_LOCKED"].includes(error && error.code);
}

function runImmediateTransaction(db, callback, { maxAttempts = 3 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      db.exec("BEGIN IMMEDIATE");
      const result = callback(db);
      db.exec("COMMIT");
      return result;
    } catch (error) {
      if (db.inTransaction) {
        db.exec("ROLLBACK");
      }
      if (!isBusyError(error)) {
        throw error;
      }
      lastError = error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25 * attempt);
    }
  }

  const error = new Error("Database is busy. Please retry.");
  error.code = "DATABASE_BUSY";
  error.status = 503;
  error.cause = lastError;
  throw error;
}

module.exports = {
  createTransactionRunner,
  isBusyError,
  runImmediateTransaction,
  runInTransaction,
};
