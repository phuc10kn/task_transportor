const fs = require("fs");
const path = require("path");
const {
  createDocsContractContext,
  parseFrontmatter,
  createIssue,
  createResult,
  finalizeResult,
  formatTextReport,
  parseCommonArgs,
  printCommonHelp,
  displayPath,
  listTheoryBasis,
  listDecisionBasis,
  THEORY_ID_PATTERN,
  DECISION_ID_PATTERN,
} = require("./lib/docs-contract");

function validateOneReferences(context, instancePath, options) {
  const issues = [];
  const warnings = [];
  const location = displayPath(context.roots.repositoryRoot, instancePath);

  if (!fs.existsSync(instancePath)) {
    issues.push(createIssue("REF-000", `Instance path does not exist: ${location}`, { path: location }));
    return { issues, warnings, skipped: false };
  }

  const content = fs.readFileSync(instancePath, "utf8");
  const parsed = parseFrontmatter(content);
  if (!parsed.ok) {
    issues.push(createIssue("REF-000", parsed.error || "missing frontmatter", { path: location }));
    return { issues, warnings, skipped: false };
  }

  const data = parsed.data || {};
  if (String(data.schema || "").trim() !== "entity-instance/v1") {
    if (options.strict) {
      issues.push(createIssue("REF-000", "schema must be entity-instance/v1", { path: location }));
      return { issues, warnings, skipped: false };
    }
    warnings.push(
      createIssue("WARN-LEGACY-001", "instance without schema skipped by references verifier", {
        path: location,
      })
    );
    return { issues, warnings, skipped: true };
  }

  for (const theoryId of listTheoryBasis(data)) {
    if (theoryId === "NOTE-CANDIDATE") {
      issues.push(createIssue("REF-001", "NOTE-CANDIDATE is not a valid theory_basis", { path: location }));
      continue;
    }
    if (theoryId === "NOTE-OPEN") {
      warnings.push(
        createIssue("REF-003", "theory_basis NOTE-OPEN requires human review", { path: location })
      );
      continue;
    }
    if (!THEORY_ID_PATTERN.test(theoryId)) {
      issues.push(createIssue("REF-001", `invalid theory id pattern: ${theoryId}`, { path: location }));
      continue;
    }
    if (!context.theoryIndex.ids.has(theoryId)) {
      issues.push(createIssue("REF-001", `theory_basis target not found: ${theoryId}`, { path: location }));
    }
  }

  for (const decisionId of listDecisionBasis(data)) {
    if (decisionId === "NOTE-CANDIDATE") {
      issues.push(createIssue("REF-002", "NOTE-CANDIDATE is not a valid decision_basis", { path: location }));
      continue;
    }
    if (decisionId === "NOTE-OPEN") {
      warnings.push(
        createIssue("REF-003", "decision_basis NOTE-OPEN requires human review", { path: location })
      );
      continue;
    }
    if (!DECISION_ID_PATTERN.test(decisionId)) {
      issues.push(createIssue("REF-002", `invalid decision id pattern: ${decisionId}`, { path: location }));
      continue;
    }
    if (!context.decisionIndex.byId.has(decisionId)) {
      issues.push(
        createIssue("REF-002", `decision_basis target not found: ${decisionId}`, { path: location })
      );
    }
  }

  return { issues, warnings, skipped: false };
}

function validateReferences(options = {}) {
  const context = createDocsContractContext(options.repositoryRoot);
  const scope = {
    mode: options.instances?.length ? "instance" : options.layer ? "layer" : "all",
    layer: options.layer || null,
    instances: options.instances || [],
  };
  const result = createResult("verify:references", scope);
  const discovered = context.discover({ layer: options.layer || null });
  const targets = options.instances?.length
    ? options.instances
    : discovered.map((item) => item.instancePath);

  for (const instancePath of targets) {
    const absolute = path.isAbsolute(instancePath)
      ? instancePath
      : path.resolve(options.repositoryRoot, instancePath);
    const outcome = validateOneReferences(context, absolute, { strict: Boolean(options.strict) });
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
    printCommonHelp("references");
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    printCommonHelp("references");
    process.exitCode = 0;
    return;
  }

  const result = validateReferences({
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
  validateReferences,
  validateOneReferences,
  main,
};
