const fs = require("fs");
const path = require("path");

function createRoots(repositoryRoot) {
  const root = path.resolve(repositoryRoot);
  return {
    repositoryRoot: root,
    metaEntityTypesRoot: path.join(root, "docs", "meta", "01-entity-types"),
    metaRulesRoot: path.join(root, "docs", "meta", "03-rules"),
    metaRelationTypesRoot: path.join(root, "docs", "meta", "02-relation-types"),
    appRoot: path.join(root, "docs", "app"),
    theoriesRoot: path.join(root, "docs", "theories"),
    decisionsRoot: path.join(root, "docs", "app", "10-decisions"),
  };
}

function displayPath(repositoryRoot, filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function isInside(parentPath, targetPath) {
  const relative = path.relative(parentPath, targetPath);
  return Boolean(relative) && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function normalizeRepoPath(filePath) {
  return String(filePath || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");
}

function resolveRepositoryPath(repositoryRoot, inputPath) {
  return path.resolve(repositoryRoot, inputPath);
}

function collectFiles(directoryPath, predicate) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const files = [];
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath, predicate));
    } else if (entry.isFile() && predicate(entry, entryPath)) {
      files.push(entryPath);
    }
  }
  return files;
}

module.exports = {
  createRoots,
  displayPath,
  isInside,
  normalizeRepoPath,
  resolveRepositoryPath,
  collectFiles,
};
