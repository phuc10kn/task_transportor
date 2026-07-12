const fs = require("fs");
const path = require("path");
const {
  createDocsContractContext,
  parseFrontmatter,
  missingHeadings,
  createIssue,
  createResult,
  finalizeResult,
  formatTextReport,
  parseCommonArgs,
  printCommonHelp,
  displayPath,
  normalizeEntityId,
} = require("./lib/docs-contract");

const REQUIRED_FIELDS = [
  "schema",
  "id",
  "slug",
  "title",
  "entity_type",
  "layer",
  "concern",
  "status",
  "summary",
];

const BASE_SECTIONS = ["Summary", "Meaning", "Relations", "Validation Notes"];

const COMMON_STATUSES = new Set([
  "draft",
  "active",
  "deprecated",
  "superseded",
  "retired",
  "closed",
  "proposed",
  "achieved",
  "abandoned",
  "identified",
  "validated",
  "addressed",
  "invalidated",
  "planned",
  "in_progress",
  "released",
]);

function expectedFolderName(id, slug) {
  const shortId = normalizeEntityId(id) || String(id || "").trim();
  return `${shortId}-${slug}`;
}

function validateOneInstance(context, instancePath, options, entityIndex) {
  const issues = [];
  const warnings = [];
  const location = displayPath(context.roots.repositoryRoot, instancePath);

  if (!fs.existsSync(instancePath)) {
    issues.push(createIssue("EINS-000", `Instance path does not exist: ${location}`, { path: location }));
    return { issues, warnings, skipped: false };
  }

  const content = fs.readFileSync(instancePath, "utf8");
  const parsed = parseFrontmatter(content);
  if (!parsed.ok) {
    issues.push(createIssue("EINS-001", parsed.error || "missing frontmatter", { path: location }));
    return { issues, warnings, skipped: false };
  }

  const data = parsed.data || {};
  const schema = String(data.schema || "").trim();
  if (schema !== "entity-instance/v1") {
    if (options.strict) {
      issues.push(
        createIssue("EINS-003", `schema must be entity-instance/v1 (got ${schema || "missing"})`, {
          path: location,
        })
      );
      return { issues, warnings, skipped: false };
    }
    warnings.push(
      createIssue("WARN-LEGACY-001", "instance without schema: entity-instance/v1 skipped", {
        path: location,
      })
    );
    return { issues, warnings, skipped: true };
  }

  let type;
  try {
    type = context.resolveTypeForInstance(instancePath);
  } catch (error) {
    issues.push(createIssue("EINS-004", error.message, { path: location }));
    return { issues, warnings, skipped: false };
  }

  for (const field of REQUIRED_FIELDS) {
    if (data[field] == null || String(data[field]).trim() === "") {
      issues.push(createIssue("EINS-002", `missing required field: ${field}`, { path: location }));
    }
  }

  const id = String(data.id || "").trim();
  const slug = String(data.slug || "").trim();
  const folderName = path.basename(path.dirname(instancePath));
  const shortId = normalizeEntityId(id);

  if (id && !shortId) {
    issues.push(createIssue("EINS-007", `invalid id format: ${id}`, { path: location }));
  }

  if (id && slug) {
    const expected = expectedFolderName(id, slug);
    if (folderName !== expected) {
      issues.push(
        createIssue(
          "EINS-007",
          `id/slug/folder mismatch: folder=${folderName}, expected=${expected}`,
          { path: location }
        )
      );
    }
  }

  if (String(data.entity_type || "").trim() !== type.typeName) {
    issues.push(
      createIssue(
        "EINS-004",
        `entity_type mismatch: got ${data.entity_type || "missing"}, expected ${type.typeName}`,
        { path: location }
      )
    );
  }

  if (type.layer && String(data.layer || "").trim() !== type.layer) {
    issues.push(
      createIssue(
        "EINS-009",
        `layer mismatch: got ${data.layer || "missing"}, expected ${type.layer}`,
        { path: location }
      )
    );
  }

  if (type.concern && String(data.concern || "").trim() !== type.concern) {
    issues.push(
      createIssue(
        "EINS-009",
        `concern mismatch: got ${data.concern || "missing"}, expected ${type.concern}`,
        { path: location }
      )
    );
  }

  const status = String(data.status || "").trim();
  if (status && !COMMON_STATUSES.has(status)) {
    issues.push(createIssue("EINS-010", `invalid status vocabulary: ${status}`, { path: location }));
  }

  if (!type.hasSchema || !type.hasStructureExtends) {
    issues.push(
      createIssue(
        "EINS-011",
        `resolved type is incomplete (schema=${type.hasSchema}, structure extends=${type.hasStructureExtends})`,
        { path: location }
      )
    );
  }

  for (const section of missingHeadings(content, BASE_SECTIONS)) {
    issues.push(createIssue("EINS-005", `missing base section: ${section}`, { path: location }));
  }

  for (const section of missingHeadings(content, type.requiredSections || [])) {
    issues.push(createIssue("EINS-006", `missing type-required section: ${section}`, { path: location }));
  }

  if (shortId && entityIndex.duplicates.includes(shortId)) {
    issues.push(createIssue("EINS-008", `duplicate entity id: ${shortId}`, { path: location }));
  }

  return { issues, warnings, skipped: false };
}

function validateEntityInstances(options = {}) {
  const repositoryRoot = options.repositoryRoot;
  const context = createDocsContractContext(repositoryRoot);
  const scope = {
    mode: options.instances?.length ? "instance" : options.layer ? "layer" : "all",
    layer: options.layer || null,
    instances: options.instances || [],
  };
  const result = createResult("verify:entity-instance", scope);

  const discovered = context.discover({ layer: options.layer || null });
  const entityIndex = context.entityIndex({ layer: options.layer || null });

  let targets;
  if (options.instances?.length) {
    targets = options.instances;
  } else {
    targets = discovered.map((item) => item.instancePath);
  }

  for (const instancePath of targets) {
    const absolute = path.isAbsolute(instancePath)
      ? instancePath
      : path.resolve(repositoryRoot, instancePath);
    const outcome = validateOneInstance(
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
    printCommonHelp("entity-instance");
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    printCommonHelp("entity-instance");
    process.exitCode = 0;
    return;
  }

  const result = validateEntityInstances({
    repositoryRoot: options.repositoryRoot,
    instances: options.instances.map((item) =>
      path.resolve(options.repositoryRoot, item)
    ),
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
  validateEntityInstances,
  validateOneInstance,
  main,
};
