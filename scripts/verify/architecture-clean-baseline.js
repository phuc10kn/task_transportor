const fs = require("fs");
const path = require("path");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const metaRoot = path.join(repositoryRoot, "docs", "meta", "01-entity-types", "05-architecture");
const appRoot = path.join(repositoryRoot, "docs", "app", "05-architecture");
const textDamageMarkers = [
  ["\uFFFD", "Unicode replacement character"],
  ["??", "consecutive question marks"],
  ["\\n", "literal newline escape"],
];
const expectedInstanceIds = new Set([
  ...Array.from({ length: 10 }, (_, index) => `MOD-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `MB-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 7 }, (_, index) => `AF-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 7 }, (_, index) => `SO-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `DF-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 1 }, (_, index) => `DU-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `CCR-${String(index + 1).padStart(3, "0")}`),
]);
const expectedCanonicalEdges = new Set([
  "AF-001|involves|MOD-002",
  "AF-001|involves|MOD-008",
  "AF-001|involves|MOD-006",
  "AF-001|involves|MOD-001",
  "AF-001|changes|SO-003",
  "AF-001|changes|SO-001",
  "AF-002|involves|MOD-002",
  "AF-002|involves|MOD-008",
  "AF-002|involves|MOD-006",
  "AF-002|changes|SO-003",
  "AF-003|involves|MOD-002",
  "AF-003|involves|MOD-008",
  "AF-003|involves|MOD-006",
  "AF-003|changes|SO-003",
  "AF-004|involves|MOD-003",
  "AF-004|involves|MOD-001",
  "AF-004|involves|MOD-006",
  "AF-004|changes|SO-002",
  "AF-004|changes|SO-001",
  "AF-004|changes|SO-003",
  "AF-005|involves|MOD-001",
  "AF-005|changes|SO-001",
  "AF-006|involves|MOD-007",
  "AF-006|involves|MOD-001",
  "AF-006|involves|MOD-004",
  "AF-006|involves|MOD-005",
  "AF-006|involves|MOD-006",
  "AF-006|changes|SO-003",
  "AF-006|changes|SO-006",
  "AF-007|involves|MOD-001",
  "AF-007|involves|MOD-006",
  "AF-007|involves|MOD-007",
  "AF-007|involves|MOD-004",
  "AF-007|involves|MOD-005",
  "AF-007|changes|SO-001",
  "AF-007|changes|SO-003",
  "AF-007|changes|SO-006",
  "MB-001|constrains|MOD-001",
  "MB-001|constrains|SO-001",
  "MB-002|constrains|MOD-001",
  "MB-002|constrains|MOD-002",
  "MB-002|constrains|MOD-003",
  "MB-002|constrains|MOD-004",
  "MB-002|constrains|MOD-005",
  "MB-002|constrains|MOD-006",
  "MB-002|constrains|MOD-007",
  "MB-002|constrains|MOD-008",
  "MB-002|constrains|MOD-009",
  "MB-002|constrains|MOD-010",
  "MB-003|constrains|MOD-010",
  "MB-003|constrains|MOD-007",
  "MB-003|constrains|MOD-003",
  "MB-004|constrains|MOD-003",
  "MB-004|constrains|SO-002",
  "MB-005|constrains|MOD-006",
  "MB-005|constrains|SO-003",
  "MB-006|constrains|MOD-007",
  "MOD-001|owns|SO-001",
  "MOD-003|owns|SO-002",
  "MOD-003|owns|SO-007",
  "MOD-004|owns|SO-005",
  "MOD-005|owns|SO-006",
  "MOD-006|owns|SO-003",
  "MOD-008|owns|SO-004",
  "DF-001|moves|SO-001",
  "DF-002|moves|SO-002",
  "DF-005|moves|SO-001",
  "DF-006|moves|SO-001",
  "DF-006|moves|SO-003",
  "SO-001|shared_via|DF-002",
  "SO-001|shared_via|DF-003",
  "SO-001|shared_via|DF-004",
  "SO-002|shared_via|DF-005",
  "SO-004|shared_via|DF-003",
  "SO-004|shared_via|DF-004",
  "SO-005|shared_via|DF-003",
  "SO-005|shared_via|DF-004",
  "SO-006|shared_via|DF-003",
  "SO-006|shared_via|DF-004",
  "DU-001|hosts|MOD-001",
  "DU-001|hosts|MOD-002",
  "DU-001|hosts|MOD-003",
  "DU-001|hosts|MOD-004",
  "DU-001|hosts|MOD-005",
  "DU-001|hosts|MOD-006",
  "DU-001|hosts|MOD-007",
  "DU-001|hosts|MOD-008",
  "DU-001|hosts|MOD-009",
  "DU-001|hosts|MOD-010",
  "CCR-001|constrains|MOD-002",
  "CCR-001|constrains|MOD-001",
  "CCR-001|constrains|MOD-003",
  "CCR-001|constrains|MOD-007",
  "CCR-001|constrains|MOD-006",
  "CCR-002|constrains|MOD-001",
  "CCR-002|constrains|MOD-002",
  "CCR-002|constrains|MOD-003",
  "CCR-002|constrains|MOD-004",
  "CCR-002|constrains|MOD-005",
  "CCR-002|constrains|MOD-006",
  "CCR-002|constrains|MOD-007",
  "CCR-002|constrains|MOD-008",
  "CCR-002|constrains|MOD-009",
  "CCR-002|constrains|MOD-010",
  "CCR-003|constrains|MOD-002",
  "CCR-003|constrains|MOD-003",
  "CCR-003|constrains|MOD-006",
  "CCR-003|constrains|MOD-007",
  "CCR-004|constrains|MOD-007",
  "CCR-004|constrains|MOD-004",
  "CCR-004|constrains|MOD-005",
  "CCR-004|constrains|MOD-001",
  "CCR-004|constrains|MOD-006",
  "CCR-005|constrains|MOD-003",
  "CCR-005|constrains|MOD-001",
  "CCR-005|constrains|MOD-005",
  "CCR-005|constrains|SO-002",
  "CCR-005|constrains|SO-001",
  "CCR-006|constrains|MOD-001",
  "CCR-006|constrains|MOD-002",
  "CCR-006|constrains|MOD-003",
  "CCR-006|constrains|MOD-004",
  "CCR-006|constrains|MOD-005",
  "CCR-006|constrains|MOD-006",
  "CCR-006|constrains|MOD-007",
  "CCR-006|constrains|MOD-008",
  "CCR-006|constrains|MOD-009",
  "CCR-006|constrains|MOD-010",
]);

function collectFiles(directoryPath, predicate) {
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

function displayPath(filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

function frontmatterValue(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

function parseRelations(frontmatter) {
  const relations = {};
  const lines = frontmatter.split(/\r?\n/);
  let insideRelations = false;
  let currentSlot = null;

  for (const line of lines) {
    if (line === "relations:") {
      insideRelations = true;
      continue;
    }
    if (!insideRelations) {
      continue;
    }

    const slot = line.match(/^  ([a-z_]+):$/);
    if (slot) {
      currentSlot = slot[1];
      relations[currentSlot] = [];
      continue;
    }

    const target = line.match(/^    - ([A-Z]+-\d+)$/);
    if (target && currentSlot) {
      relations[currentSlot].push(target[1]);
      continue;
    }

    if (!line.startsWith(" ")) {
      break;
    }
  }

  return relations;
}

function parseRelatedEntityLinks(content) {
  const lines = content.split(/\r?\n/);
  const links = [];
  let insideRelatedEntities = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "## Related Entities") {
      insideRelatedEntities = true;
      continue;
    }
    if (insideRelatedEntities && line.startsWith("## ")) {
      break;
    }
    if (!insideRelatedEntities || !line.startsWith("- ") || !line.includes("](")) {
      continue;
    }

    const markdownLinks = [...line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    if (markdownLinks.length === 0) {
      continue;
    }

    const classification = line.match(/^- (Canonical relation|Context\/evidence): /);
    links.push({
      classification: classification ? classification[1] : null,
      line: index + 1,
      markdownLinkCount: markdownLinks.length,
      targetId: (markdownLinks[0][1].match(/^([A-Z]+-\d+)/) || [])[1],
    });
  }

  return links;
}

function parseRelationTemplate(typeContent) {
  const slots = new Map();
  const pattern = /^\|\s*([a-z_]+)\s*\|\s*`([^`]+)`\s*\|\s*([A-Za-z]+)\s*\|/gm;
  let match;

  while ((match = pattern.exec(typeContent)) !== null) {
    slots.set(match[1], { relationType: match[2], targetType: match[3] });
  }

  return slots;
}

function parseRequiredSections(typeContent) {
  const match = typeContent.match(/Section bắt buộc:\r?\n\r?\n([\s\S]*?)\r?\n\r?\nSection tùy chọn:/);
  if (!match) {
    return [];
  }

  return match[1]
    .split(/\r?\n/)
    .map((line) => line.match(/^- (.+)$/))
    .filter(Boolean)
    .map((section) => section[1]);
}

function parseValidTriples(content) {
  const triples = new Set();
  const pattern = /^\|\s*([A-Za-z]+)\s*\|\s*`([^`]+)`\s*\|\s*([A-Za-z]+)\s*\|/gm;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    triples.add(`${match[1]}|${match[2]}|${match[3]}`);
  }

  return triples;
}

function main() {
  const errors = [];
  const typeFiles = collectFiles(metaRoot, (entry) => entry.name.endsWith(".md") && entry.name !== "README.md");
  const typesByDirectory = new Map();
  const relationTemplates = new Map();

  for (const typePath of typeFiles) {
    const typeContent = fs.readFileSync(typePath, "utf8");
    const typeName = (typeContent.match(/^# ([A-Za-z]+)$/m) || [])[1];
    const relativeDirectory = path.relative(metaRoot, path.dirname(typePath));
    if (!typeName) {
      errors.push(`${displayPath(typePath)} missing entity type title`);
      continue;
    }
    typesByDirectory.set(relativeDirectory, {
      typeName,
      typePath,
      requiredSections: parseRequiredSections(typeContent),
    });
    relationTemplates.set(typeName, parseRelationTemplate(typeContent));
  }

  const validTriples = parseValidTriples(
    fs.readFileSync(path.join(repositoryRoot, "docs", "meta", "03-rules", "05-architecture", "valid-triples.md"), "utf8")
  );
  const instances = [];

  for (const [relativeDirectory, type] of typesByDirectory) {
    const appTypeDirectory = path.join(appRoot, relativeDirectory);
    if (!fs.existsSync(appTypeDirectory)) {
      continue;
    }

    for (const entry of fs.readdirSync(appTypeDirectory, { withFileTypes: true })) {
      const instancePath = path.join(appTypeDirectory, entry.name, "README.md");
      if (entry.isDirectory() && fs.existsSync(instancePath)) {
        instances.push({
          instancePath,
          typeName: type.typeName,
          requiredSections: type.requiredSections,
        });
      }
    }
  }

  const instancesById = new Map();
  for (const instance of instances) {
    const content = fs.readFileSync(instance.instancePath, "utf8");
    const frontmatter = parseFrontmatter(content);
    const location = displayPath(instance.instancePath);

    for (const [marker, description] of textDamageMarkers) {
      if (content.includes(marker)) {
        errors.push(`${location} contains ${description}; repair the document encoding/content`);
      }
    }

    if (!frontmatter) {
      errors.push(`${location} missing YAML frontmatter`);
      continue;
    }

    for (const [field, expected] of Object.entries({
      schema: "entity-instance/v1",
      layer: "05-architecture",
    })) {
      if (frontmatterValue(frontmatter, field) !== expected) {
        errors.push(`${location} must declare ${field}: ${expected}`);
      }
    }

    for (const field of ["id", "slug", "title", "entity_type", "concern", "status", "summary"]) {
      if (!frontmatterValue(frontmatter, field)) {
        errors.push(`${location} missing frontmatter field: ${field}`);
      }
    }

    if (frontmatterValue(frontmatter, "entity_type") !== instance.typeName) {
      errors.push(`${location} entity_type does not match canonical type: ${instance.typeName}`);
    }

    const id = frontmatterValue(frontmatter, "id");
    if (id) {
      if (instancesById.has(id)) {
        errors.push(`${location} duplicates entity ID: ${id}`);
      }
      instancesById.set(id, { ...instance, content, frontmatter, id });
    }

    const normalizedContent = content.toLocaleLowerCase();
    for (const heading of ["## Summary", "## Meaning", "## Relations", "## Validation Notes"]) {
      if (!normalizedContent.includes(heading.toLocaleLowerCase())) {
        errors.push(`${location} missing base section: ${heading}`);
      }
    }

    for (const section of instance.requiredSections) {
      if (!normalizedContent.includes(`## ${section}`.toLocaleLowerCase())) {
        errors.push(`${location} missing type-required section: ## ${section}`);
      }
    }
  }

  for (const expectedId of expectedInstanceIds) {
    if (!instancesById.has(expectedId)) {
      errors.push(`Architecture clean baseline is missing expected instance: ${expectedId}`);
    }
  }
  for (const actualId of instancesById.keys()) {
    if (!expectedInstanceIds.has(actualId)) {
      errors.push(`Architecture clean baseline has unrecorded instance: ${actualId}`);
    }
  }

  let edgeCount = 0;
  const observedCanonicalEdges = new Set();
  for (const instance of instancesById.values()) {
    const slots = relationTemplates.get(instance.typeName) || new Map();
    const relations = parseRelations(instance.frontmatter);

    for (const [slotName, targetIds] of Object.entries(relations)) {
      const slot = slots.get(slotName);
      if (!slot) {
        errors.push(`${displayPath(instance.instancePath)} relation slot is not declared: ${slotName}`);
        continue;
      }

      for (const targetId of targetIds) {
        edgeCount += 1;
        observedCanonicalEdges.add(`${instance.id}|${slot.relationType}|${targetId}`);
        const target = instancesById.get(targetId);
        if (!target) {
          errors.push(`${displayPath(instance.instancePath)} relation target does not exist: ${targetId}`);
          continue;
        }
        if (target.typeName !== slot.targetType) {
          errors.push(
            `${displayPath(instance.instancePath)} slot ${slotName} expects ${slot.targetType}, got ${target.typeName}`
          );
        }
        if (!validTriples.has(`${instance.typeName}|${slot.relationType}|${target.typeName}`)) {
          errors.push(
            `${displayPath(instance.instancePath)} has no valid triple: ` +
            `${instance.typeName} --${slot.relationType}--> ${target.typeName}`
          );
        }
      }
    }
  }

  for (const expectedEdge of expectedCanonicalEdges) {
    if (!observedCanonicalEdges.has(expectedEdge)) {
      errors.push(`Architecture clean baseline is missing expected relation: ${expectedEdge}`);
    }
  }
  for (const actualEdge of observedCanonicalEdges) {
    if (!expectedCanonicalEdges.has(actualEdge)) {
      errors.push(`Architecture clean baseline has unrecorded relation: ${actualEdge}`);
    }
  }

  const directRelationPairs = new Set();
  for (const edge of observedCanonicalEdges) {
    const [sourceId, , targetId] = edge.split("|");
    directRelationPairs.add(`${sourceId}|${targetId}`);
    directRelationPairs.add(`${targetId}|${sourceId}`);
  }

  for (const instance of instancesById.values()) {
    const location = displayPath(instance.instancePath);
    for (const link of parseRelatedEntityLinks(instance.content)) {
      if (!link.classification) {
        errors.push(`${location}:${link.line} Related Entities link must be classified as Canonical relation or Context/evidence`);
        continue;
      }
      if (link.markdownLinkCount !== 1) {
        errors.push(`${location}:${link.line} Related Entities bullet must contain exactly one Markdown link`);
        continue;
      }
      if (link.classification !== "Canonical relation") {
        continue;
      }
      if (!link.targetId) {
        errors.push(`${location}:${link.line} Canonical relation link must target an entity ID`);
        continue;
      }
      if (!directRelationPairs.has(`${instance.id}|${link.targetId}`)) {
        errors.push(`${location}:${link.line} Canonical relation link has no direct canonical edge: ${instance.id} <-> ${link.targetId}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("Architecture clean baseline verification failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Architecture clean baseline verification passed (${instances.length} instances; ${edgeCount} canonical edges).`);
}

main();
