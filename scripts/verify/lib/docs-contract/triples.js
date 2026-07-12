const fs = require("fs");
const path = require("path");
const { collectFiles } = require("./paths");

function parseValidTriples(content) {
  const triples = new Set();
  const pattern = /^\|\s*([A-Za-z]+)\s*\|\s*`([^`]+)`\s*\|\s*([A-Za-z]+)\s*\|/gm;
  let match;
  while ((match = pattern.exec(String(content || ""))) !== null) {
    if (match[1] === "Source") {
      continue;
    }
    triples.add(`${match[1]}|${match[2]}|${match[3]}`);
  }
  return triples;
}

function loadValidTripleRegistry(roots) {
  const files = collectFiles(
    roots.metaRulesRoot,
    (entry, entryPath) => entry.name === "valid-triples.md"
  );
  const triples = new Set();
  const byFile = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = parseValidTriples(content);
    for (const triple of parsed) {
      triples.add(triple);
    }
    byFile.push({
      filePath,
      relativePath: path.relative(roots.repositoryRoot, filePath).split(path.sep).join("/"),
      triples: parsed,
    });
  }

  return { triples, byFile };
}

function hasValidTriple(registry, sourceType, relationType, targetType) {
  return registry.triples.has(`${sourceType}|${relationType}|${targetType}`);
}

module.exports = {
  parseValidTriples,
  loadValidTripleRegistry,
  hasValidTriple,
};
