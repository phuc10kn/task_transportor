const { createApp } = require("./app");
const { loadConfig } = require("./config/env");
const { migrate } = require("./infrastructure/database/migrate");
const { ensureStorage } = require("./infrastructure/storage/bootstrap");

function startServer() {
  const config = loadConfig();

  ensureStorage(config.storage);
  migrate({ config });

  const app = createApp({ config });
  const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
