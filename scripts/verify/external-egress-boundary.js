const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const modulesRoot = path.join(root, "src", "modules");
const errors = [];
const providerImportAllowlist = new Set([
  "src/modules/Backlog/infrastructure/BacklogClient.js",
  "src/modules/Jira/infrastructure/JiraClient.js",
  "src/modules/Translation/infrastructure/translationAdapterFor.js",
]);
const scopeImportAllowlist = new Set([
  "src/modules/Backlog/infrastructure/BacklogClient.js",
  "src/modules/Jira/infrastructure/JiraClient.js",
  "src/modules/Sync/application/runJobNow.js",
  "src/modules/Backlog/application/pullIssue.js",
  "src/modules/Backlog/application/syncCandidateToCis.js",
  "src/modules/Jira/application/requestJiraSync.js",
]);

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? files(target) : entry.isFile() && entry.name.endsWith(".js") ? [target] : [];
  });
}

const networkPatterns = [
  /\b(?:globalThis\.)?fetch\s*\(/,
  /require\s*\(\s*["'](?:node:)?(?:http|https|http2|net|tls)["']\s*\)/,
  /from\s+["'](?:node:)?(?:http|https|http2|net|tls)["']/,
  /require\s*\(\s*["']undici["']\s*\)/,
];

for (const file of files(modulesRoot)) {
  const content = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file).split(path.sep).join("/");
  for (const pattern of networkPatterns) {
    if (pattern.test(content)) errors.push(`${relative} bypasses the external/AI transport boundary (${pattern}).`);
  }
  if (/infrastructure\/external\/providers\//.test(content) && !providerImportAllowlist.has(relative)) {
    errors.push(`${relative} imports a concrete external provider gateway.`);
  }
  if (/infrastructure\/external\/transports\//.test(content)) {
    errors.push(`${relative} imports an external transport directly.`);
  }
  if (/infrastructure\/external\/core\/createExternalAccessScope/.test(content) && !scopeImportAllowlist.has(relative)) {
    errors.push(`${relative} imports external scope internals outside the allowlist.`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("External egress boundary verification passed.");
}
