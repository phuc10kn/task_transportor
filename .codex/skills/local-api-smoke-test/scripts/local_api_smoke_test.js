#!/usr/bin/env node
const { spawn } = require("child_process");
const http = require("http");
const https = require("https");

function parseArgs(argv) {
  const args = {
    baseUrl: "http://127.0.0.1:3000",
    healthPath: "/api/v1/health",
    missingPath: "/api/v1/not-found-check",
    cwd: process.cwd(),
    startCommand: "node src/server.js",
    startupTimeoutMs: 10000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === "--base-url") args.baseUrl = value;
    if (key === "--health-path") args.healthPath = value;
    if (key === "--missing-path") args.missingPath = value;
    if (key === "--cwd") args.cwd = value;
    if (key === "--start-command") args.startCommand = value;
    if (key === "--startup-timeout-ms") args.startupTimeoutMs = Number(value);

    if (key.startsWith("--")) i += 1;
  }

  return args;
}

function requestJson(url) {
  const client = url.startsWith("https:") ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(url, { method: "GET", timeout: 5000 }, (res) => {
      let rawBody = "";

      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        rawBody += chunk;
      });
      res.on("end", () => {
        let body;
        try {
          body = JSON.parse(rawBody);
        } catch (error) {
          reject(new Error(`Invalid JSON from ${url}: ${rawBody}`));
          return;
        }

        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body,
          rawBody,
        });
      });
    });

    req.on("timeout", () => {
      req.destroy(new Error(`Request timeout: ${url}`));
    });
    req.on("error", reject);
    req.end();
  });
}

function joinUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

async function waitForServer(baseUrl, healthPath, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      await requestJson(joinUrl(baseUrl, healthPath));
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error(`Server did not become ready: ${baseUrl}`);
}

function startServer(command, cwd) {
  if (!command) {
    return null;
  }

  return spawn(command, {
    cwd,
    shell: true,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function printResult(result) {
  console.log(`GET ${result.url} -> ${result.status}`);
  if (result.headers["x-correlation-id"]) {
    console.log(`x-correlation-id: ${result.headers["x-correlation-id"]}`);
  }
  console.log(`Body: ${result.rawBody}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let startedProcess = null;

  try {
    try {
      await requestJson(joinUrl(args.baseUrl, args.healthPath));
    } catch (error) {
      if (!args.startCommand) {
        throw error;
      }

      startedProcess = startServer(args.startCommand, args.cwd);
      await waitForServer(args.baseUrl, args.healthPath, args.startupTimeoutMs);
    }

    const health = await requestJson(joinUrl(args.baseUrl, args.healthPath));
    assert(health.status === 200, `Expected health status 200, got ${health.status}`);
    assert(health.body && health.body.data && health.body.data.status === "ok", "Expected health body data.status to be ok");
    printResult(health);

    const missing = await requestJson(joinUrl(args.baseUrl, args.missingPath));
    assert(missing.status === 404, `Expected missing endpoint status 404, got ${missing.status}`);
    assert(missing.body && missing.body.error, "Expected error envelope");
    assert(missing.body.error.correlation_id, "Expected body error.correlation_id");
    assert(
      missing.headers["x-correlation-id"] === missing.body.error.correlation_id,
      "Expected x-correlation-id header to match body error.correlation_id"
    );
    printResult(missing);

    console.log("Local API smoke test passed.");
  } finally {
    if (startedProcess && !startedProcess.killed) {
      startedProcess.kill();
    }
  }
}

main().catch((error) => {
  console.error(`Local API smoke test failed: ${error.message}`);
  process.exitCode = 1;
});
