"use strict";

const path = require("path");
const { spawn } = require("child_process");

const appDir = path.join(__dirname, "..", "apps", "admin-web");
const portIndex = process.argv.indexOf("--port");
const port = portIndex >= 0 && process.argv[portIndex + 1] ? process.argv[portIndex + 1] : process.env.ADMIN_WEB_PORT || "3001";
const child = spawn(process.execPath, [path.join(appDir, "server.js"), "--port", String(port)], {
  cwd: appDir,
  env: process.env,
  stdio: "inherit",
  windowsHide: false,
});

child.once("error", (error) => { console.error(error); process.exitCode = 1; });
child.once("exit", (code) => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
