const fs = require("fs");
const path = require("path");
const { collectFiles, displayPath, isInside } = require("./paths");

function parseTypeName(content) {
  const match = String(content || "").match(/^#\s+([A-Za-z][A-Za-z0-9]*)\s*$/m);
  return match ? match[1] : null;
}

function parseHeaderField(content, fieldName) {
  const pattern = new RegExp(`^\\|\\s*\\*\\*${fieldName}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "im");
  const match = String(content || "").match(pattern);
  if (!match) {
    return null;
  }
  return match[1].replace(/`/g, "").trim();
}

function parseRequiredSections(content) {
  const text = String(content || "");
  const english = text.match(
    /Required sections:\s*\r?\n\r?\n([\s\S]*?)(?:\r?\n\r?\n(?:Optional sections:|Additional validation:|## )|$)/i
  );
  const vietnamese = text.match(
    /Section bắt buộc:\s*\r?\n\r?\n([\s\S]*?)(?:\r?\n\r?\n(?:Section tùy chọn:|Validation bổ sung:|## )|$)/i
  );
  const block = (english && english[1]) || (vietnamese && vietnamese[1]) || "";
  return block
    .split(/\r?\n/)
    .map((line) => line.match(/^- (.+)$/))
    .filter(Boolean)
    .map((match) => match[1].replace(/`/g, "").trim())
    .filter(Boolean);
}

function parseRelationTemplate(content) {
  const slots = new Map();
  const pattern =
    /^\|\s*([a-z_]+)\s*\|\s*`([^`]+)`\s*\|\s*([A-Za-z]+)\s*\|\s*([a-z_]+)\s*\|\s*([^|]+)\|/gm;
  let match;
  while ((match = pattern.exec(String(content || ""))) !== null) {
    slots.set(match[1], {
      slot: match[1],
      relationType: match[2],
      targetType: match[3],
      requirementMode: match[4].trim(),
      cardinality: match[5].trim(),
    });
  }

  // Fallback for older 3-column tables used in some architecture parsers.
  if (slots.size === 0) {
    const simple = /^\|\s*([a-z_]+)\s*\|\s*`([^`]+)`\s*\|\s*([A-Za-z]+)\s*\|/gm;
    while ((match = simple.exec(String(content || ""))) !== null) {
      if (match[1] === "Slot") {
        continue;
      }
      slots.set(match[1], {
        slot: match[1],
        relationType: match[2],
        targetType: match[3],
        requirementMode: "allowed_when_known",
        cardinality: "0..n",
      });
    }
  }

  return slots;
}

function hasSchemaMarker(content) {
  return /^\|\s*\*\*schema\*\*\s*\|/im.test(String(content || ""));
}

function hasStructureExtends(content) {
  return /^##\s+structure extends\s*$/im.test(String(content || ""));
}

function loadEntityTypeRegistry(roots) {
  const typeFiles = collectFiles(
    roots.metaEntityTypesRoot,
    (entry) => entry.name.endsWith(".md") && entry.name !== "README.md"
  );
  const byRelativeDirectory = new Map();
  const byTypeName = new Map();

  for (const typePath of typeFiles) {
    const content = fs.readFileSync(typePath, "utf8");
    const typeName = parseTypeName(content) || parseHeaderField(content, "name");
    const relativeDirectory = path
      .relative(roots.metaEntityTypesRoot, path.dirname(typePath))
      .split(path.sep)
      .join("/");
    const record = {
      typePath,
      typeName,
      relativeDirectory,
      layer: parseHeaderField(content, "layer"),
      concern: parseHeaderField(content, "concern"),
      folder: parseHeaderField(content, "folder"),
      idPattern: parseHeaderField(content, "ID pattern"),
      hasSchema: hasSchemaMarker(content),
      hasStructureExtends: hasStructureExtends(content),
      requiredSections: parseRequiredSections(content),
      relationSlots: parseRelationTemplate(content),
      displayPath: displayPath(roots.repositoryRoot, typePath),
    };

    byRelativeDirectory.set(relativeDirectory, record);
    if (typeName) {
      byTypeName.set(typeName, record);
    }
  }

  return { byRelativeDirectory, byTypeName, typeFiles };
}

function resolveTypeForInstance(roots, instancePath, registry) {
  if (path.basename(instancePath) !== "README.md" || !isInside(roots.appRoot, instancePath)) {
    throw new Error(`Instance must be a docs/app instance README: ${displayPath(roots.repositoryRoot, instancePath)}`);
  }

  const appTypeDirectory = path.dirname(path.dirname(instancePath));
  const relativeDirectory = path
    .relative(roots.appRoot, appTypeDirectory)
    .split(path.sep)
    .join("/");
  const type = registry.byRelativeDirectory.get(relativeDirectory);
  if (!type) {
    throw new Error(`No canonical entity type directory for instance: ${displayPath(roots.repositoryRoot, instancePath)}`);
  }
  return type;
}

function discoverInstances(roots, registry, options = {}) {
  const layerFilter = options.layer || null;
  const instances = [];

  for (const [relativeDirectory, type] of registry.byRelativeDirectory.entries()) {
    if (layerFilter && !relativeDirectory.startsWith(`${layerFilter}/`) && relativeDirectory !== layerFilter) {
      continue;
    }
    const appTypeDirectory = path.join(roots.appRoot, relativeDirectory);
    if (!fs.existsSync(appTypeDirectory)) {
      continue;
    }
    for (const entry of fs.readdirSync(appTypeDirectory, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const instancePath = path.join(appTypeDirectory, entry.name, "README.md");
      if (!fs.existsSync(instancePath)) {
        continue;
      }
      instances.push({
        instancePath,
        folderName: entry.name,
        relativeDirectory,
        type,
      });
    }
  }

  return instances;
}

module.exports = {
  parseTypeName,
  parseHeaderField,
  parseRequiredSections,
  parseRelationTemplate,
  hasSchemaMarker,
  hasStructureExtends,
  loadEntityTypeRegistry,
  resolveTypeForInstance,
  discoverInstances,
};
