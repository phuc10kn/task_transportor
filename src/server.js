const { createApp } = require("./app");
const { loadConfig } = require("./config/env");
const { migrate } = require("./infrastructure/database/migrate");
const { ensureStorage } = require("./infrastructure/storage/bootstrap");
const AuthApi = require("./modules/Auth/AuthApi");
const SyncApi = require("./modules/Sync/SyncApi");

function startServer() {
  const config = loadConfig();

  ensureStorage(config.storage);
  migrate({ config });
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    AuthApi.bootstrapAdmin({ config });
  }

  const app = createApp({ config });
  const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });

  if (config.worker.enabled) {
    const worker = SyncApi.createWorker({ config });
    worker.start().catch((error) => {
      console.error("Worker failed to start:", error.message);
    });
    server.on("close", () => worker.stop());
  }

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
