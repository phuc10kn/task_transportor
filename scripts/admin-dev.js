const path = require("path");
const { spawn, spawnSync } = require("child_process");

const appDir = path.join(__dirname, "..", "apps", "admin-web");
const portIndex = process.argv.indexOf("--port");
const port = portIndex >= 0 && process.argv[portIndex + 1] ? process.argv[portIndex + 1] : process.env.ADMIN_WEB_PORT || "3001";
const nextBinary = path.join(appDir, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBinary, "dev", "--port", String(port)], { cwd: appDir, env: process.env, stdio: "inherit", windowsHide: false });
let stopping = false;

function stop() {
  if (stopping || child.exitCode !== null) return;
  stopping = true;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  } else {
    child.kill("SIGTERM");
  }
}

process.once("SIGINT", stop);
process.once("SIGTERM", stop);
child.once("error", (error) => { console.error(error); process.exitCode = 1; });
child.once("exit", (code, signal) => {
  if (!stopping && signal) process.exitCode = 1;
  else if (!stopping && code !== null) process.exitCode = code;
});
