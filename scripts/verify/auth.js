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
  assert.match(result.stdout, /System admin created|System admin already exists/);
}

function assertAdminPasswordIsHashed(config) {
  const db = createConnection({ config });
  const admin = db.prepare("SELECT email, password_hash, system_role FROM users WHERE email = ?").get("admin@example.test");
  db.close();

  assert.equal(admin.email, "admin@example.test");
  assert.notEqual(admin.password_hash, "correct-horse-battery");
  assert.match(admin.password_hash, /^scrypt\$/);
  assert.equal(admin.system_role, "system_admin");
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

  config.auth.google = { enabled: true, clientId: "test-google-client", publicOrigin: "http://admin.example.test" };
  const app = createApp({
    config,
    googleVerifier: {
      async verify(credential) {
        if (credential !== "valid-google-token") throw new Error("invalid token");
        return { email: env.ADMIN_EMAIL.toUpperCase(), email_verified: true };
      },
    },
  });
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
    assert.equal(login.body.data.user.email, env.ADMIN_EMAIL);
    assert.equal(login.body.data.user.system_role, "system_admin");
    const createdUser = await requestJson(server, {
      method: "POST", pathname: "/api/v1/users", token: login.body.data.token,
      body: { email: "ordinary@example.test", password: "ordinary-password", system_role: "user" },
    });
    assert.equal(createdUser.status, 201);
    const ordinaryLogin = await requestJson(server, { method: "POST", pathname: "/api/v1/auth/login", body: { email: "ordinary@example.test", password: "ordinary-password" } });
    const forbiddenUsers = await requestJson(server, { pathname: "/api/v1/users", token: ordinaryLogin.body.data.token });
    assert.equal(forbiddenUsers.status, 403);
    const lastAdminDemotion = await requestJson(server, {
      method: "PATCH", pathname: `/api/v1/users/${login.body.data.user.id}`, token: login.body.data.token,
      body: { system_role: "user" },
    });
    assert.equal(lastAdminDemotion.status, 409);

    const me = await requestJson(server, {
      pathname: "/api/v1/auth/me",
      token: login.body.data.token,
    });
    assert.equal(me.status, 200);
    assert.equal(me.body.data.user.email, env.ADMIN_EMAIL);

    const google = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google",
      headers: { origin: "http://admin.example.test" },
      body: { credential: "valid-google-token" },
    });
    assert.equal(google.status, 200);
    assert.equal(google.body.data.user.email, env.ADMIN_EMAIL);

    const rejectedOrigin = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google",
      headers: { origin: "http://evil.example.test" },
      body: { credential: "valid-google-token" },
    });
    assert.equal(rejectedOrigin.status, 403);
    const invalidToken = await requestJson(server, {
      method: "POST", pathname: "/api/v1/auth/google",
      headers: { origin: "http://admin.example.test" }, body: { credential: "invalid" },
    });
    assert.equal(invalidToken.status, 401);

    const unknownGoogle = createApp({
      config,
      googleVerifier: { async verify() { return { email: "unknown@example.test", email_verified: true }; } },
    });
    await withServer(unknownGoogle, async (unknownServer) => {
      const response = await requestJson(unknownServer, {
        method: "POST",
        pathname: "/api/v1/auth/google",
        headers: { origin: "http://admin.example.test" },
        body: { credential: "unknown" },
      });
      assert.equal(response.status, 401);
    });
  });

  console.log("Auth verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
