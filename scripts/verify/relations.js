const fs = require("fs");
const path = require("path");
const {
  createDocsContractContext,
  parseFrontmatter,
  asRelationsMap,
  createIssue,
  createResult,
  finalizeResult,
  formatTextReport,
  parseCommonArgs,
  printCommonHelp,
  displayPath,
  normalizeEntityId,
  isPseudoTarget,
  hasValidTriple,
} = require("./lib/docs-contract");

function validateOneRelations(context, instancePath, options, entityIndex) {
  const issues = [];
  const warnings = [];
  const location = displayPath(context.roots.repositoryRoot, instancePath);

  if (!fs.existsSync(instancePath)) {
    issues.push(createIssue("REL-000", `Instance path does not exist: ${location}`, { path: location }));
    return { issues, warnings, skipped: false };
  }

  const content = fs.readFileSync(instancePath, "utf8");
  const parsed = parseFrontmatter(content);
  if (!parsed.ok) {
    issues.push(createIssue("REL-000", parsed.error || "missing frontmatter", { path: location }));
    return { issues, warnings, skipped: false };
  }

  const data = parsed.data || {};
  if (String(data.schema || "").trim() !== "entity-instance/v1") {
    if (options.strict) {
      issues.push(createIssue("REL-000", "schema must be entity-instance/v1", { path: location }));
      return { issues, warnings, skipped: false };
    }
    warnings.push(
      createIssue("WARN-LEGACY-001", "instance without schema skipped by relations verifier", {
        path: location,
      })
    );
    return { issues, warnings, skipped: true };
  }

  let type;
  try {
    type = context.resolveTypeForInstance(instancePath);
  } catch (error) {
    issues.push(createIssue("REL-000", error.message, { path: location }));
    return { issues, warnings, skipped: false };
  }

  let relations;
  try {
    relations = asRelationsMap(data.relations);
  } catch (error) {
    issues.push(createIssue("REL-001", error.message, { path: location }));
    return { issues, warnings, skipped: false };
  }

  const slots = type.relationSlots || new Map();
  const sourceId = normalizeEntityId(String(data.id || "").trim());
  const seenEdges = new Set();

  if (Object.keys(relations).length > 0 && slots.size === 0) {
    issues.push(
      createIssue(
        "REL-001",
        "relations present but entity type declares no outbound slots",
        { path: location }
      )
    );
  }

  for (const [slotName, targets] of Object.entries(relations)) {
    const slot = slots.get(slotName);
    if (!slot) {
      issues.push(createIssue("REL-001", `undeclared relation slot: ${slotName}`, { path: location }));
      continue;
    }

    if (!Array.isArray(targets) || targets.length === 0) {
      if (slot.requirementMode === "required_at_creation" && String(data.status || "").trim() === "active") {
        issues.push(
          createIssue(
            "REL-007",
            `required_at_creation slot is empty while status=active: ${slotName}`,
            { path: location }
          )
        );
      }
      continue;
    }

    for (const targetRaw of targets) {
      if (isPseudoTarget(targetRaw)) {
        issues.push(
          createIssue("REL-006", `pseudo/invalid relation target: ${targetRaw}`, { path: location })
        );
        continue;
      }

      const targetId = normalizeEntityId(targetRaw);
      if (!targetId) {
        issues.push(
          createIssue("REL-006", `invalid relation target id pattern: ${targetRaw}`, { path: location })
        );
        continue;
      }

      const edgeKey = `${sourceId}|${slotName}|${targetId}`;
      if (seenEdges.has(edgeKey)) {
        issues.push(createIssue("REL-008", `duplicate relation edge: ${edgeKey}`, { path: location }));
        continue;
      }
      seenEdges.add(edgeKey);

      const target = entityIndex.byId.get(targetId);
      if (!target) {
        issues.push(createIssue("REL-002", `relation target not found: ${targetId}`, { path: location }));
        continue;
      }

      if (target.entityType !== slot.targetType) {
        issues.push(
          createIssue(
            "REL-003",
            `target entity_type mismatch for slot ${slotName}: expected ${slot.targetType}, got ${target.entityType}`,
            { path: location }
          )
        );
      }

      if (!hasValidTriple(context.tripleRegistry, type.typeName, slot.relationType, target.entityType)) {
        issues.push(
          createIssue(
            "REL-004",
            `invalid triple: ${type.typeName} --${slot.relationType}--> ${target.entityType}`,
            { path: location }
          )
        );
      }
    }
  }

  for (const [slotName, slot] of slots.entries()) {
    const targets = relations[slotName] || [];
    if (
      slot.requirementMode === "required_at_creation" &&
      targets.length === 0 &&
      String(data.status || "").trim() === "active"
    ) {
      issues.push(
        createIssue(
          "REL-007",
          `required_at_creation slot missing while status=active: ${slotName}`,
          { path: location }
        )
      );
    }
  }

  return { issues, warnings, skipped: false };
}

function validateRelations(options = {}) {
  const context = createDocsContractContext(options.repositoryRoot);
  const scope = {
    mode: options.instances?.length ? "instance" : options.layer ? "layer" : "all",
    layer: options.layer || null,
    instances: options.instances || [],
  };
  const result = createResult("verify:relations", scope);
  const discovered = context.discover({ layer: options.layer || null });
  // Relation targets may live outside the scoped layer; index the whole app.
  const entityIndex = context.entityIndex({});

  const targets = options.instances?.length
    ? options.instances
    : discovered.map((item) => item.instancePath);

  for (const instancePath of targets) {
    const absolute = path.isAbsolute(instancePath)
      ? instancePath
      : path.resolve(options.repositoryRoot, instancePath);
    const outcome = validateOneRelations(
      context,
      absolute,
      { strict: Boolean(options.strict) },
      entityIndex
    );
    if (outcome.skipped) {
      result.summary.skipped += 1;
    } else {
      result.summary.checked += 1;
    }
    result.violations.push(...outcome.issues);
    result.warnings.push(...outcome.warnings);
  }

  return finalizeResult(result);
}

function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseCommonArgs(argv);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    printCommonHelp("relations");
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    printCommonHelp("relations");
    process.exitCode = 0;
    return;
  }

  const result = validateRelations({
    repositoryRoot: options.repositoryRoot,
    instances: options.instances.map((item) => path.resolve(options.repositoryRoot, item)),
    layer: options.layer,
    all: options.all,
    strict: options.strict,
  });

  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const output = formatTextReport(result);
    if (result.verdict === "failed") {
      process.stderr.write(output);
    } else {
      process.stdout.write(output);
    }
  }

  process.exitCode = result.verdict === "failed" ? 1 : 0;
}

if (require.main === module) {
  main();
}

module.exports = {
  validateRelations,
  validateOneRelations,
  main,
};
