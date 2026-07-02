const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { createApp } = require("../../src/app");
const { loadConfig } = require("../../src/config/env");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

async function main() {
  const config = makeTempConfig("foundation");

  ensureStorage(config.storage);
  for (const dirPath of [
    config.storage.root,
    config.storage.databaseDir,
    config.storage.attachments,
    config.storage.backups,
    config.storage.logs,
  ]) {
    assert.ok(fs.existsSync(dirPath), `Missing storage directory: ${dirPath}`);
  }

  migrate({ config });
  migrate({ config });

  const db = createConnection({ config });
  const migrationTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'")
    .get();
  db.close();

  assert.equal(migrationTable.name, "schema_migrations");

  const app = createApp({ config });
  await withServer(app, async (server) => {
    const health = await requestJson(server, { pathname: "/api/v1/health" });
    assert.equal(health.status, 200);
    assert.equal(health.body.data.status, "ok");

    const missing = await requestJson(server, { pathname: "/missing-route" });
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error.code, "NOT_FOUND");
    assert.ok(missing.body.error.correlation_id);
    assert.equal(missing.headers["x-correlation-id"], missing.body.error.correlation_id);
  });

  assert.throws(
    () => loadConfig({
      NODE_ENV: "production",
      DATABASE_PATH: path.join(config.storage.root, "prod.sqlite"),
      STORAGE_ROOT: config.storage.root,
      ATTACHMENT_STORAGE_PATH: config.storage.attachments,
    }),
    /Missing required production env: JWT_SECRET/
  );

  console.log("Foundation verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
