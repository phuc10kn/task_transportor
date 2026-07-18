const { createApp } = require("./app");
const { loadConfig } = require("./config/env");
const { migrate } = require("./infrastructure/database/migrate");
const { ensureStorage } = require("./infrastructure/storage/bootstrap");
const { getLogger } = require("./infrastructure/observability/logger");
const AuthApi = require("./modules/Auth/AuthApi");
const SyncApi = require("./modules/Sync/SyncApi");

function startServer() {
  const config = loadConfig();
  const logger = getLogger(config);

  ensureStorage(config.storage);
  migrate({ config });
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    AuthApi.bootstrapAdmin({ config });
  }

  const app = createApp({ config });
  const server = app.listen(config.port, () => {
    logger.info({ event: "server.started", host: "localhost", port: config.port });
  });

  let worker = null;
  if (config.worker.enabled) {
    worker = SyncApi.createWorker({ config });
    worker.start().catch((error) => {
      logger.error({
        event: "worker.start_failed",
        error: { code: error.code || "WORKER_START_FAILED", message: error.message },
      });
    });
  }

  server.on("close", async () => {
    if (worker) await worker.stop();
    logger.info({ event: "server.stopped" });
    logger.close();
  });

  return server;
}

if (require.main === module) {
  const server = startServer();
  const shutdown = () => server.close();
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

module.exports = { startServer };
