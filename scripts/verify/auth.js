const assert = require("assert");
const childProcess = require("child_process");
const path = require("path");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempEnv } = require("./helpers/tempConfig");
const { loadConfig } = require("../../src/config/env");

function runAdminCreateCli(env) {
  const result = childProcess.spawnSync(process.execPath, ["scripts/admin-create.js"], {
    cwd: path.resolve(__dirname, "../.."),
    env: { ...process.env, ...env },
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Admin created|Admin already exists/);
}

function assertAdminPasswordIsHashed(config) {
  const db = createConnection({ config });
  const admin = db.prepare("SELECT email, password_hash FROM admin_users WHERE email = ?").get("admin@example.test");
  db.close();

  assert.equal(admin.email, "admin@example.test");
  assert.notEqual(admin.password_hash, "correct-horse-battery");
  assert.match(admin.password_hash, /^scrypt\$/);
}

async function main() {
  const env = makeTempEnv("auth", {
    ADMIN_EMAIL: "admin@example.test",
    ADMIN_PASSWORD: "correct-horse-battery",
    JWT_EXPIRES_IN_SECONDS: "3600",
  });
  const config = loadConfig(env);

  ensureStorage(config.storage);
  migrate({ config });
  runAdminCreateCli(env);
  assertAdminPasswordIsHashed(config);

  const app = createApp({ config });
  await withServer(app, async (server) => {
    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: {
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      },
    });
    assert.equal(login.status, 200);
    assert.ok(login.body.data.token);
    assert.equal(login.body.data.admin.email, env.ADMIN_EMAIL);

    const me = await requestJson(server, {
      pathname: "/api/v1/auth/me",
      token: login.body.data.token,
    });
    assert.equal(me.status, 200);
    assert.equal(me.body.data.admin.email, env.ADMIN_EMAIL);
  });

  console.log("Auth verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
