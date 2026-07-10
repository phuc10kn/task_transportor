const fs = require("fs");
const path = require("path");

const repositoryRoot = path.resolve(__dirname, "..");
const metaRoot = path.join(repositoryRoot, "docs", "meta", "01-entity-types", "05-architecture");
const appRoot = path.join(repositoryRoot, "docs", "app", "05-architecture");

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

function parseRelationTemplate(typeContent) {
  const slots = new Map();
  const pattern = /^\|\s*([a-z_]+)\s*\|\s*`([^`]+)`\s*\|\s*([A-Za-z]+)\s*\|/gm;
  let match;

  while ((match = pattern.exec(typeContent)) !== null) {
    slots.set(match[1], { relationType: match[2], targetType: match[3] });
  }

  return slots;
}

function loadGraph() {
  const typesByDirectory = new Map();
  const typeFiles = collectFiles(metaRoot, (entry) => entry.name.endsWith(".md") && entry.name !== "README.md");

  for (const typePath of typeFiles) {
    const content = fs.readFileSync(typePath, "utf8");
    const typeName = (content.match(/^# ([A-Za-z]+)$/m) || [])[1];
    if (!typeName) {
      continue;
    }

    typesByDirectory.set(path.relative(metaRoot, path.dirname(typePath)), {
      typeName,
      relationSlots: parseRelationTemplate(content),
    });
  }

  const nodes = new Map();
  const edges = [];
  for (const [relativeDirectory, type] of typesByDirectory) {
    const instanceDirectory = path.join(appRoot, relativeDirectory);
    if (!fs.existsSync(instanceDirectory)) {
      continue;
    }

    for (const entry of fs.readdirSync(instanceDirectory, { withFileTypes: true })) {
      const instancePath = path.join(instanceDirectory, entry.name, "README.md");
      if (!entry.isDirectory() || !fs.existsSync(instancePath)) {
        continue;
      }

      const content = fs.readFileSync(instancePath, "utf8");
      const frontmatter = parseFrontmatter(content);
      if (!frontmatter) {
        continue;
      }

      const id = frontmatterValue(frontmatter, "id");
      if (!id) {
        continue;
      }

      nodes.set(id, {
        id,
        title: frontmatterValue(frontmatter, "title") || id,
        entityType: frontmatterValue(frontmatter, "entity_type") || type.typeName,
      });

      for (const [slotName, targetIds] of Object.entries(parseRelations(frontmatter))) {
        const slot = type.relationSlots.get(slotName);
        if (!slot) {
          continue;
        }

        for (const targetId of targetIds) {
          edges.push({
            source: id,
            relation: slot.relationType,
            target: targetId,
          });
        }
      }
    }
  }

  return { nodes, edges };
}

function traceGraph(graph, { from, relation = null, direction = "both", depth = 1 }) {
  if (!graph.nodes.has(from)) {
    throw new Error(`Unknown architecture instance: ${from}`);
  }

  const includeForward = direction === "both" || direction === "forward";
  const includeReverse = direction === "both" || direction === "reverse";
  const traversed = [];
  const visited = new Set([from]);
  let frontier = [from];

  for (let currentDepth = 1; currentDepth <= depth && frontier.length; currentDepth += 1) {
    const nextFrontier = [];
    for (const currentId of frontier) {
      for (const edge of graph.edges) {
        if (relation && edge.relation !== relation) {
          continue;
        }

        if (includeForward && edge.source === currentId) {
          traversed.push({ ...edge, direction: "canonical", depth: currentDepth });
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            nextFrontier.push(edge.target);
          }
        }

        if (includeReverse && edge.target === currentId) {
          traversed.push({ ...edge, direction: "derived_reverse", depth: currentDepth });
          if (!visited.has(edge.source)) {
            visited.add(edge.source);
            nextFrontier.push(edge.source);
          }
        }
      }
    }
    frontier = nextFrontier;
  }

  const uniqueEdges = [];
  const seen = new Set();
  for (const edge of traversed) {
    const key = `${edge.source}|${edge.relation}|${edge.target}|${edge.direction}|${edge.depth}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueEdges.push(edge);
    }
  }

  return {
    from,
    relation,
    direction,
    depth,
    nodes: [...visited].map((id) => graph.nodes.get(id)),
    edges: uniqueEdges,
  };
}

function parseArguments(argumentsList) {
  const options = { from: null, relation: null, direction: "both", depth: 1, format: "text" };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const option = argumentsList[index];
    const value = argumentsList[index + 1];

    if (option === "--help") {
      options.help = true;
      continue;
    }
    if (option === "--reverse") {
      options.direction = "reverse";
      continue;
    }
    if (option === "--forward") {
      options.direction = "forward";
      continue;
    }
    if (option === "--from" || option === "--relation" || option === "--depth" || option === "--format") {
      if (!value) {
        throw new Error(`Missing value for ${option}`);
      }
      options[option.slice(2)] = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${option}`);
  }

  options.depth = Number(options.depth);
  if (!Number.isInteger(options.depth) || options.depth < 1) {
    throw new Error("--depth must be a positive integer");
  }
  if (!["text", "json"].includes(options.format)) {
    throw new Error("--format must be text or json");
  }
  if (!options.help && !options.from) {
    throw new Error("--from is required");
  }

  return options;
}

function helpText() {
  return [
    "Usage: npm run architecture:trace -- --from <ID> [--relation <name>] [--reverse|--forward] [--depth <n>] [--format text|json]",
    "Default direction is both canonical outbound and derived reverse edges.",
    "--reverse returns only derived reverse edges; no inverse edges are written to documentation.",
  ].join("\n");
}

function printText(trace, graph) {
  console.log(`Trace from ${trace.from} (direction: ${trace.direction}; depth: ${trace.depth})`);
  if (trace.relation) {
    console.log(`Relation filter: ${trace.relation}`);
  }
  if (!trace.edges.length) {
    console.log("No matching canonical or derived edges.");
    return;
  }

  for (const edge of trace.edges) {
    const source = graph.nodes.get(edge.source);
    const target = graph.nodes.get(edge.target);
    if (edge.direction === "canonical") {
      console.log(`[${edge.depth}] ${source.id} --${edge.relation}--> ${target.id}`);
    } else {
      console.log(`[${edge.depth}] ${target.id} <--${edge.relation}-- ${source.id} (derived)`);
    }
  }
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    console.log(helpText());
    return;
  }

  try {
    const graph = loadGraph();
    const trace = traceGraph(graph, options);
    if (options.format === "json") {
      console.log(JSON.stringify(trace, null, 2));
    } else {
      printText(trace, graph);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadGraph,
  parseArguments,
  traceGraph,
};
