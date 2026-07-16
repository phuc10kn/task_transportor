const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repositoryRoot = path.resolve(__dirname, "../..");
const oldApiContract = /\/api\/v1\/(?:dashboard|issues|translations\/issues|translation-queue|mapping-settings|mapping-rules|anomalies|sync-jobs|sync-journal|attachments)(?:\/|["'`?])/g;
const oldRouteDeclaration = /\brouter\.(?:use|get|post|put|patch|delete)\(\s*["'`]\/(?:dashboard|issues|translations\/issues|translation-queue|mapping-settings|mapping-rules|anomalies|sync-jobs|sync-journal|attachments)(?:\/|["'`])/g;

function javascriptFiles(root, predicate = () => true) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return javascriptFiles(absolute, predicate);
    return entry.isFile() && entry.name.endsWith(".js") && predicate(absolute) ? [absolute] : [];
  });
}

function matches(files, pattern) {
  return files.flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    const found = [...source.matchAll(pattern)];
    return found.map((match) => `${path.relative(repositoryRoot, file)}: ${match[0]}`);
  });
}

const routeFiles = javascriptFiles(path.join(repositoryRoot, "src/modules"), (file) => path.basename(file) === "routes.js");
const callerFiles = [
  ...javascriptFiles(path.join(repositoryRoot, "apps/admin-web/public")),
  ...javascriptFiles(path.join(repositoryRoot, "scripts/verify"), (file) => path.basename(file) !== "project-scope-static.js"),
];

assert.deepEqual(matches(routeFiles, oldRouteDeclaration), [], "Legacy workspace route declarations remain.");
assert.deepEqual(matches(callerFiles, oldApiContract), [], "Legacy workspace API callers remain.");

console.log("Project scope static cutover verification passed.");
