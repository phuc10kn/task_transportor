const { spawnSync } = require("child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["--prefix", "apps/admin-web", "run", "ci"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    CIS_API_ORIGIN: process.env.CIS_API_ORIGIN || "http://127.0.0.1:3000",
  },
});

if (result.error) {
  console.error(result.error);
}
process.exitCode = result.status === null ? 1 : result.status;
