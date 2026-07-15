const path = require("path");
const fs = require("fs");
const { spawn, spawnSync } = require("child_process");

const appDir = path.join(__dirname, "..", "apps", "admin-web");
const portIndex = process.argv.indexOf("--port");
const port = portIndex >= 0 && process.argv[portIndex + 1] ? process.argv[portIndex + 1] : process.env.ADMIN_WEB_PORT || "3001";
const nextBinary = path.join(appDir, "node_modules", "next", "dist", "bin", "next");
const stableMode = process.argv.includes("--stable");
const cssFile = path.join(appDir, "app", "globals.css");
const distDir = path.resolve(appDir, process.env.NEXT_DIST_DIR || ".next");
let child;
let stopping = false;
let restarting = false;
let restartTimer;
let cssWatcher;

function clearDevCache() {
  if (!stableMode) return;
  fs.rmSync(path.join(distDir, "dev"), { force: true, maxRetries: 3, recursive: true, retryDelay: 100 });
}

function start() {
  clearDevCache();
  child = spawn(process.execPath, [nextBinary, "dev", "--port", String(port)], { cwd: appDir, env: process.env, stdio: "inherit", windowsHide: false });
  child.once("error", (error) => { console.error(error); process.exitCode = 1; });
  child.once("exit", (code, signal) => {
    if (restarting) { restarting = false; start(); return; }
    if (!stopping && signal) process.exitCode = 1;
    else if (!stopping && code !== null) process.exitCode = code;
  });
}

function restart() {
  if (stopping || restarting) return;
  restarting = true;
  if (child.exitCode !== null) { restarting = false; start(); return; }
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  } else {
    child.kill("SIGTERM");
  }
}

function stop() {
  if (stopping || child.exitCode !== null) return;
  stopping = true;
  if (restartTimer) clearTimeout(restartTimer);
  cssWatcher?.close();
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  } else {
    child.kill("SIGTERM");
  }
}

start();
if (stableMode) {
  console.log("CSS stable mode: restart dev server after globals.css changes.");
  cssWatcher = fs.watch(cssFile, () => {
    clearTimeout(restartTimer);
    restartTimer = setTimeout(restart, 120);
  });
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
