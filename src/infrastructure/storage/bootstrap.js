const fs = require("fs");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function ensureStorage(storageConfig) {
  [
    storageConfig.root,
    storageConfig.databaseDir,
    storageConfig.attachments,
    storageConfig.backups,
    storageConfig.logs,
  ].forEach(ensureDir);
}

module.exports = {
  ensureStorage,
};
