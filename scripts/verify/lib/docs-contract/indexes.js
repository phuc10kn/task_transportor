const fs = require("fs");
const path = require("path");
const { collectFiles, displayPath } = require("./paths");
const { parseFrontmatter, asStringList } = require("./frontmatter");

const ENTITY_ID_PATTERN = /^[A-Z][A-Z0-9]*-\d{3}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
const SHORT_ENTITY_ID_PATTERN = /^[A-Z][A-Z0-9]*-\d{3}$/;
const THEORY_ID_PATTERN = /^TH-[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const DECISION_ID_PATTERN = /^DEC-\d{3}$/;

function normalizeEntityId(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }
  if (SHORT_ENTITY_ID_PATTERN.test(text) || ENTITY_ID_PATTERN.test(text)) {
    return text.split("-").slice(0, 2).join("-");
  }
  const match = text.match(/^([A-Z][A-Z0-9]*-\d{3})/);
  return match ? match[1] : null;
}

function isPseudoTarget(value) {
  const text = String(value || "").trim().toLowerCase();
  return (
    !text ||
    text === "entities" ||
    text.includes("wildcard") ||
    text.includes("_any") ||
    text.includes("layer / entity") ||
    text.includes("layers/entities")
  );
}

function buildEntityIndex(roots, discoveredInstances, parseFrontmatterFn = parseFrontmatter) {
  const byId = new Map();
  const duplicates = [];

  for (const item of discoveredInstances) {
    const content = fs.readFileSync(item.instancePath, "utf8");
    const parsed = parseFrontmatterFn(content);
    if (!parsed.ok || !parsed.data) {
      continue;
    }
    const id = String(parsed.data.id || "").trim();
    if (!id) {
      continue;
    }
    const shortId = normalizeEntityId(id) || id;
    const record = {
      id: shortId,
      rawId: id,
      slug: String(parsed.data.slug || "").trim(),
      entityType: String(parsed.data.entity_type || "").trim(),
      layer: String(parsed.data.layer || "").trim(),
      concern: String(parsed.data.concern || "").trim(),
      status: String(parsed.data.status || "").trim(),
      schema: String(parsed.data.schema || "").trim(),
      instancePath: item.instancePath,
      folderName: item.folderName,
      type: item.type,
      data: parsed.data,
      content,
      displayPath: displayPath(roots.repositoryRoot, item.instancePath),
    };

    if (byId.has(shortId)) {
      duplicates.push(shortId);
    }
    byId.set(shortId, record);
  }

  return { byId, duplicates: [...new Set(duplicates)] };
}

function buildTheoryIndex(roots) {
  const ids = new Set();
  if (!fs.existsSync(roots.theoriesRoot)) {
    return { ids };
  }

  const files = collectFiles(roots.theoriesRoot, (entry) => entry.name.endsWith(".md"));
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const match of content.matchAll(/`?(TH-[A-Z0-9]+(?:-[A-Z0-9]+)*)`?/g)) {
      ids.add(match[1]);
    }
  }

  const catalogPath = path.join(roots.theoriesRoot, "README.md");
  if (fs.existsSync(catalogPath)) {
    const content = fs.readFileSync(catalogPath, "utf8");
    for (const match of content.matchAll(/`?(TH-[A-Z0-9]+(?:-[A-Z0-9]+)*)`?/g)) {
      ids.add(match[1]);
    }
  }

  return { ids };
}

function buildDecisionIndex(roots) {
  const byId = new Map();
  if (!fs.existsSync(roots.decisionsRoot)) {
    return { byId };
  }

  const files = collectFiles(
    roots.decisionsRoot,
    (entry, entryPath) => entry.name === "README.md" && path.basename(path.dirname(entryPath)).startsWith("DEC-")
  );

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = parseFrontmatter(content);
    const folderName = path.basename(path.dirname(filePath));
    const folderId = folderName.match(/^(DEC-\d{3})/)?.[1];
    const id = String(parsed.data?.id || folderId || "").trim();
    if (!id) {
      continue;
    }
    byId.set(id, {
      id,
      schema: String(parsed.data?.schema || "").trim(),
      path: filePath,
      displayPath: displayPath(roots.repositoryRoot, filePath),
      data: parsed.data || {},
    });
  }

  return { byId };
}

function listTheoryBasis(data) {
  return asStringList(data?.theory_basis);
}

function listDecisionBasis(data) {
  return asStringList(data?.decision_basis);
}

module.exports = {
  ENTITY_ID_PATTERN,
  SHORT_ENTITY_ID_PATTERN,
  THEORY_ID_PATTERN,
  DECISION_ID_PATTERN,
  normalizeEntityId,
  isPseudoTarget,
  buildEntityIndex,
  buildTheoryIndex,
  buildDecisionIndex,
  listTheoryBasis,
  listDecisionBasis,
};
