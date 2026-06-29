const assert = require("assert");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const { createApp } = require("../../src/app");
const { loadConfig } = require("../../src/config/env");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");

function makeTempConfig() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "task-transportor-phase00-"));

  return loadConfig({
    NODE_ENV: "test",
    PORT: "0",
    DATABASE_PATH: path.join(root, "storage", "db", "cis.sqlite"),
    STORAGE_ROOT: path.join(root, "storage"),
    ATTACHMENT_STORAGE_PATH: path.join(root, "storage", "attachments"),
    BACKUP_STORAGE_PATH: path.join(root, "storage", "backups"),
    LOG_STORAGE_PATH: path.join(root, "storage", "logs"),
    JWT_SECRET: "phase00-test-secret",
  });
}

function requestJson(server, pathname) {
  const { port } = server.address();

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: pathname,
        method: "GET",
      },
      (res) => {
        let body = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: JSON.parse(body),
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

async function withServer(app, callback) {
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once("listening", resolve));
    await callback(server);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

async function main() {
  const config = makeTempConfig();

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
    const health = await requestJson(server, "/api/v1/health");
    assert.equal(health.status, 200);
    assert.equal(health.body.data.status, "ok");

    const missing = await requestJson(server, "/missing-route");
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

  console.log("Phase 00 verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
