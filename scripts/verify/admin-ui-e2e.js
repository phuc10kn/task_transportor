const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const { createApp } = require("../../src/app");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const { makeTempConfig } = require("./helpers/tempConfig");

const adminWebDir = path.resolve(__dirname, "../../apps/admin-web");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function waitForHttp(url, timeoutMs = 60000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on("error", retry);
      request.setTimeout(2000, () => request.destroy());
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(attempt, 250);
    };

    attempt();
  });
}

function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    return;
  }
  child.kill("SIGTERM");
}

async function main() {
  const config = makeTempConfig("admin-ui-next-e2e", {
    BACKLOG_FAKE_FIXTURE_PATH: path.join(process.cwd(), "scripts", "verify", "fixtures", "backlog-issue.json"),
    JIRA_FAKE_MODE: "1",
  });
  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({ config, email: "admin-ui@example.test", password: "verify-password" });

  const api = createApp({ config });
  const apiServer = api.listen(0);
  let nextProcess;

  try {
    await new Promise((resolve) => apiServer.once("listening", resolve));
    const apiPort = apiServer.address().port;
    const loginResponse = await fetch(`http://127.0.0.1:${apiPort}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin-ui@example.test", password: "verify-password" }),
    });
    if (!loginResponse.ok) {
      throw new Error(`Admin API login preflight failed with status ${loginResponse.status}: ${await loginResponse.text()}`);
    }
    const webPort = Number(process.env.ADMIN_WEB_E2E_PORT || 3101);
    nextProcess = spawn(npmCommand, ["run", "dev", "--", "--port", String(webPort)], {
      cwd: adminWebDir,
      env: {
        ...process.env,
        CIS_API_ORIGIN: `http://127.0.0.1:${apiPort}`,
        NEXT_PUBLIC_CIS_API_ORIGIN: `http://127.0.0.1:${apiPort}`,
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      shell: process.platform === "win32",
      stdio: process.env.CI ? "ignore" : "inherit",
    });
    await waitForHttp(`http://127.0.0.1:${webPort}/login`);
    const result = spawnSync(npmCommand, ["run", "e2e", "--", "--reporter=line"], {
      cwd: adminWebDir,
      env: { ...process.env, ADMIN_WEB_BASE_URL: `http://127.0.0.1:${webPort}`, CI: "1" },
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(`Admin UI Playwright exited with status ${result.status}`);
    }
    console.log("Admin UI Next foundation E2E passed.");
  } finally {
    stopProcess(nextProcess);
    await new Promise((resolve) => apiServer.close(() => resolve()));
    const tempRoot = path.resolve(path.dirname(config.database.path), "../..");
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
