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
  const admin = db.prepare("SELECT email, password_hash, password_configured, system_role FROM users WHERE email = ?").get("admin@example.test");
  db.close();
  assert.equal(admin.email, "admin@example.test");
  assert.notEqual(admin.password_hash, "correct-horse-battery");
  assert.match(admin.password_hash, /^scrypt\$/);
  assert.equal(admin.password_configured, 1);
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
  const identities = {
    "admin-google-token": { subject: "google-admin", email: env.ADMIN_EMAIL.toUpperCase(), email_verified: true, name: "Admin Google" },
    "new-google-token": { subject: "google-new", email: "google-user@example.test", email_verified: true, name: "Google User" },
    "mismatch-google-token": { subject: "google-mismatch", email: "different@example.test", email_verified: true, name: "Different User" },
  };
  const app = createApp({
    config,
    googleVerifier: {
      async verify(credential) {
        if (!identities[credential]) throw new Error("invalid token");
        return identities[credential];
      },
    },
  });

  await withServer(app, async (server) => {
    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.data.user.system_role, "system_admin");
    assert.equal(login.body.data.user.has_password, true);
    assert.equal(login.body.data.user.google_linked, false);

    const createdUser = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/users",
      token: login.body.data.token,
      body: { email: "ordinary@example.test", password: "ordinary-password", system_role: "user" },
    });
    assert.equal(createdUser.status, 201);
    const ordinaryLogin = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: { email: "ordinary@example.test", password: "ordinary-password" },
    });
    assert.equal(ordinaryLogin.status, 200);
    const updatedOwnProfile = await requestJson(server, {
      method: "PATCH",
      pathname: "/api/v1/auth/me",
      token: ordinaryLogin.body.data.token,
      body: { name: "  Ordinary User  ", email: "hijack@example.test", system_role: "system_admin" },
    });
    assert.equal(updatedOwnProfile.status, 200);
    assert.equal(updatedOwnProfile.body.data.name, "Ordinary User");
    assert.equal(updatedOwnProfile.body.data.email, "ordinary@example.test");
    assert.equal(updatedOwnProfile.body.data.system_role, "user");
    const invalidOwnProfile = await requestJson(server, {
      method: "PATCH",
      pathname: "/api/v1/auth/me",
      token: ordinaryLogin.body.data.token,
      body: { name: "x".repeat(121) },
    });
    assert.equal(invalidOwnProfile.status, 422);
    assert.equal(invalidOwnProfile.body.error.code, "PROFILE_NAME_TOO_LONG");
    const forbiddenUsers = await requestJson(server, { pathname: "/api/v1/users", token: ordinaryLogin.body.data.token });
    assert.equal(forbiddenUsers.status, 403);
    const lastAdminDemotion = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/users/${login.body.data.user.id}`,
      token: login.body.data.token,
      body: { system_role: "user" },
    });
    assert.equal(lastAdminDemotion.status, 409);
    const deleteSelf = await requestJson(server, {
      method: "DELETE",
      pathname: `/api/v1/users/${login.body.data.user.id}`,
      token: login.body.data.token,
    });
    assert.equal(deleteSelf.status, 409);
    assert.equal(deleteSelf.body.error.code, "CANNOT_DELETE_SELF");
    const forbiddenDelete = await requestJson(server, {
      method: "DELETE",
      pathname: `/api/v1/users/${login.body.data.user.id}`,
      token: ordinaryLogin.body.data.token,
    });
    assert.equal(forbiddenDelete.status, 403);

    const unlinkedGoogleLogin = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google",
      headers: { origin: "http://admin.example.test" },
      body: { credential: "admin-google-token" },
    });
    assert.equal(unlinkedGoogleLogin.status, 409);
    assert.equal(unlinkedGoogleLogin.body.error.code, "GOOGLE_LINK_REQUIRED");

    const linked = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google/link",
      headers: { origin: "http://admin.example.test" },
      token: login.body.data.token,
      body: { credential: "admin-google-token" },
    });
    assert.equal(linked.status, 200);
    assert.equal(linked.body.data.google_linked, true);
    assert.equal(linked.body.data.google_email, env.ADMIN_EMAIL);

    const googleLogin = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google",
      headers: { origin: "http://admin.example.test" },
      body: { credential: "admin-google-token" },
    });
    assert.equal(googleLogin.status, 200);
    assert.equal(googleLogin.body.data.user.id, login.body.data.user.id);
    assert.equal(googleLogin.body.data.user.system_role, "system_admin");

    const mismatch = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google/link",
      headers: { origin: "http://admin.example.test" },
      token: ordinaryLogin.body.data.token,
      body: { credential: "mismatch-google-token" },
    });
    assert.equal(mismatch.status, 422);
    assert.equal(mismatch.body.error.code, "GOOGLE_EMAIL_MISMATCH");

    const googleFirst = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google",
      headers: { origin: "http://admin.example.test" },
      body: { credential: "new-google-token" },
    });
    assert.equal(googleFirst.status, 200);
    assert.equal(googleFirst.body.data.user.email, "google-user@example.test");
    assert.equal(googleFirst.body.data.user.name, "Google User");
    assert.equal(googleFirst.body.data.user.system_role, "user");
    assert.equal(googleFirst.body.data.user.google_linked, true);
    assert.equal(googleFirst.body.data.user.has_password, false);

    const noPasswordLogin = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: { email: "google-user@example.test", password: "unknown-password" },
    });
    assert.equal(noPasswordLogin.status, 401);
    const configuredPassword = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/password",
      token: googleFirst.body.data.token,
      body: { password: "google-user-password" },
    });
    assert.equal(configuredPassword.status, 200);
    assert.equal(configuredPassword.body.data.has_password, true);
    const passwordLogin = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: { email: "google-user@example.test", password: "google-user-password" },
    });
    assert.equal(passwordLogin.status, 200);
    const configureAgain = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/password",
      token: googleFirst.body.data.token,
      body: { password: "another-password" },
    });
    assert.equal(configureAgain.status, 409);

    const rejectedOrigin = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google",
      headers: { origin: "http://evil.example.test" },
      body: { credential: "admin-google-token" },
    });
    assert.equal(rejectedOrigin.status, 403);
    const invalidToken = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/google",
      headers: { origin: "http://admin.example.test" },
      body: { credential: "invalid" },
    });
    assert.equal(invalidToken.status, 401);

    const ownedProject = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token: ordinaryLogin.body.data.token,
      body: { name: "Owned project" },
    });
    assert.equal(ownedProject.status, 201);
    const blockedOwnerDelete = await requestJson(server, {
      method: "DELETE",
      pathname: `/api/v1/users/${createdUser.body.data.id}`,
      token: login.body.data.token,
    });
    assert.equal(blockedOwnerDelete.status, 409);
    assert.equal(blockedOwnerDelete.body.error.code, "USER_DELETE_BLOCKED");

    const deletedGoogleUser = await requestJson(server, {
      method: "DELETE",
      pathname: `/api/v1/users/${googleFirst.body.data.user.id}`,
      token: login.body.data.token,
    });
    assert.equal(deletedGoogleUser.status, 200);
    assert.deepEqual(deletedGoogleUser.body.data, { id: googleFirst.body.data.user.id, deleted: true });
    const deletedSession = await requestJson(server, { pathname: "/api/v1/auth/me", token: googleFirst.body.data.token });
    assert.equal(deletedSession.status, 401);

    const db = createConnection({ config });
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM users WHERE id = ?").get(googleFirst.body.data.user.id).total, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM user_identities WHERE user_id = ?").get(googleFirst.body.data.user.id).total, 0);
    db.close();

    const missingDelete = await requestJson(server, {
      method: "DELETE",
      pathname: "/api/v1/users/999999",
      token: login.body.data.token,
    });
    assert.equal(missingDelete.status, 404);
  });

  console.log("Auth verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
