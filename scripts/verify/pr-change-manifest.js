const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG_PATH = path.join(__dirname, "pr-change-manifest.config.json");

function loadConfig(configPath = DEFAULT_CONFIG_PATH) {
  const raw = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);
  if (!config || typeof config !== "object") {
    throw new Error("Config must be a JSON object.");
  }
  if (!Array.isArray(config.trigger_prefixes) || !Array.isArray(config.trigger_files)) {
    throw new Error("Config requires trigger_prefixes and trigger_files arrays.");
  }
  return config;
}

function stripHtmlComments(text) {
  return String(text || "").replace(/<!--[\s\S]*?-->/g, "");
}

function normalizePath(filePath) {
  return String(filePath || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");
}

function matchesPrefix(filePath, prefixes = []) {
  return prefixes.some((prefix) => filePath === prefix || filePath.startsWith(prefix));
}

function matchesExact(filePath, files = []) {
  return files.includes(filePath);
}

function isExcluded(filePath, config) {
  return matchesPrefix(filePath, config.exclude_prefixes || []);
}

function isTriggeredPath(filePath, config) {
  if (!filePath || isExcluded(filePath, config)) {
    return false;
  }
  return (
    matchesPrefix(filePath, config.trigger_prefixes) ||
    matchesExact(filePath, config.trigger_files)
  );
}

function isCodePath(filePath, config) {
  if (!filePath || isExcluded(filePath, config)) {
    return false;
  }
  return (
    matchesPrefix(filePath, config.code_prefixes || []) ||
    matchesExact(filePath, config.code_files || [])
  );
}

function isDocsAppPath(filePath, config) {
  if (!filePath || isExcluded(filePath, config)) {
    return false;
  }
  const prefix = config.docs_app_prefix || "docs/app/";
  return filePath === "docs/app" || filePath.startsWith(prefix);
}

function collectChangedPaths(files = []) {
  const paths = [];
  for (const entry of files) {
    if (typeof entry === "string") {
      const normalized = normalizePath(entry);
      if (normalized) {
        paths.push(normalized);
      }
      continue;
    }
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const filename = normalizePath(entry.filename);
    const previous = normalizePath(entry.previous_filename);
    if (filename) {
      paths.push(filename);
    }
    if (previous) {
      paths.push(previous);
    }
  }
  return [...new Set(paths)];
}

function evaluatePathTrigger(files, config) {
  const changedPaths = collectChangedPaths(files);
  const matchedPaths = changedPaths.filter((filePath) => isTriggeredPath(filePath, config));
  const touchesCode = changedPaths.some((filePath) => isCodePath(filePath, config));
  const docsAppChangedPaths = changedPaths.filter((filePath) => isDocsAppPath(filePath, config));

  return {
    required: matchedPaths.length > 0,
    changedPaths,
    matchedPaths,
    touchesCode,
    docsAppChangedPaths,
  };
}

function isPlaceholderValue(value) {
  const text = String(value || "").trim();
  if (!text) {
    return true;
  }
  if (/^<!--/.test(text) || /-->$/.test(text)) {
    return true;
  }
  if (/^<|>$/.test(text)) {
    return true;
  }
  if (/^(todo|tbd|n\/a|na|xxx|\.+|-+)$/i.test(text)) {
    return true;
  }
  return false;
}

function meaningful(value) {
  return !isPlaceholderValue(value);
}

function stripFenceAndComments(body) {
  const withoutComments = stripHtmlComments(body);
  const lines = [];
  let insideFence = false;

  for (const line of withoutComments.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) {
      continue;
    }
    lines.push(line);
  }

  return lines.join("\n");
}

function extractSections(body) {
  const lines = stripFenceAndComments(body).split(/\r?\n/);
  const sections = new Map();
  let current = null;
  let buffer = [];

  function flush() {
    if (!current) {
      return;
    }
    sections.set(current, buffer.join("\n").trim());
    buffer = [];
  }

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      flush();
      current = heading[1].trim().toLowerCase();
      continue;
    }
    if (current) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function parseKeyValues(sectionText) {
  const values = {};
  for (const line of String(sectionText || "").split(/\r?\n/)) {
    const match = line.match(/^\s*[-*]\s+([^:]+):\s*(.*)$/);
    if (!match) {
      continue;
    }
    const key = match[1].trim().toLowerCase();
    const value = match[2].trim();
    values[key] = value;
  }
  return values;
}

function parseBulletPaths(sectionText, keyLabel) {
  const lines = String(sectionText || "").split(/\r?\n/);
  const paths = [];
  let collecting = false;

  for (const line of lines) {
    const keyMatch = line.match(/^\s*[-*]\s+([^:]+):\s*(.*)$/);
    if (keyMatch) {
      const key = keyMatch[1].trim().toLowerCase();
      collecting = key === keyLabel.toLowerCase();
      const inline = keyMatch[2].trim();
      if (collecting && meaningful(inline) && !inline.startsWith("-")) {
        paths.push(normalizePath(inline));
      }
      continue;
    }

    if (!collecting) {
      continue;
    }

    const nested = line.match(/^\s{2,}[-*]\s+(.+)$/);
    if (nested) {
      const value = nested[1].trim();
      if (meaningful(value)) {
        paths.push(normalizePath(value));
      }
      continue;
    }

    if (/^\s*[-*]\s+/.test(line) || /^##\s+/.test(line)) {
      collecting = false;
    }
  }

  return [...new Set(paths)];
}

function parseTestEvidenceTable(sectionText) {
  const rows = [];
  for (const line of String(sectionText || "").split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) {
      continue;
    }
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
    if (cells.length < 3) {
      continue;
    }
    if (/^-{3,}$/.test(cells[0].replace(/\s/g, "")) || /^command$/i.test(cells[0])) {
      continue;
    }
    rows.push({
      command: cells[0],
      result: cells[1].toLowerCase(),
      coverage: cells[2],
    });
  }
  return rows;
}

function parseConfirmations(sectionText) {
  const checks = {
    sync: false,
    docs: false,
    tests: false,
  };

  for (const line of String(sectionText || "").split(/\r?\n/)) {
    const match = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (!match || match[1].toLowerCase() !== "x") {
      continue;
    }
    const text = match[2].toLowerCase();
    if (text.includes("sync")) {
      checks.sync = true;
    }
    if (text.includes("docs impact") || text.includes("docs/app")) {
      checks.docs = true;
    }
    if (text.includes("test evidence")) {
      checks.tests = true;
    }
  }

  return checks;
}

function parseManifest(body, config) {
  const marker = config.marker || "PR-CHANGE-MANIFEST";
  const version = Number(config.manifest_version || 1);
  const markerPattern = new RegExp(`<!--\\s*${marker}:v(\\d+)\\s*-->`, "i");
  const markerMatch = String(body || "").match(markerPattern);
  const sections = extractSections(body);
  const classification = parseKeyValues(sections.get("classification") || "");
  const behavior = parseKeyValues(sections.get("behavior delta") || "");
  const docs = parseKeyValues(sections.get("docs impact") || "");
  const docsPaths = parseBulletPaths(sections.get("docs impact") || "", "changed docs/app paths");
  const testRows = parseTestEvidenceTable(sections.get("test evidence") || "");
  const confirmations = parseConfirmations(sections.get("confirmation") || "");

  return {
    hasMarker: Boolean(markerMatch),
    markerVersion: markerMatch ? Number(markerMatch[1]) : null,
    expectedVersion: version,
    hasClassification: sections.has("classification"),
    hasBehaviorDelta: sections.has("behavior delta"),
    hasDocsImpact: sections.has("docs impact"),
    hasTestEvidence: sections.has("test evidence"),
    hasConfirmation: sections.has("confirmation"),
    productBehaviorChange: String(classification["product behavior change"] || "")
      .trim()
      .toLowerCase(),
    changeStage: String(classification["change stage"] || "")
      .trim()
      .toLowerCase(),
    syncVerdict: String(classification["sync verdict"] || "")
      .trim()
      .toLowerCase(),
    authority: classification.authority || "",
    syncResultReference: classification["sync result reference"] || "",
    before: behavior.before || "",
    after: behavior.after || "",
    unchangedGuardrails: behavior["unchanged guardrails"] || "",
    noBehaviorChangeReason: behavior["no behavior change reason"] || "",
    docsPaths,
    noDocsImpactReason: docs["no docs impact reason"] || "",
    testRows,
    confirmations,
  };
}

function violation(id, message) {
  return { id, message };
}

function validateManifest(body, files, config) {
  const pathInfo = evaluatePathTrigger(files, config);
  const result = {
    required: pathInfo.required,
    verdict: "skipped",
    matchedPaths: pathInfo.matchedPaths,
    changedPaths: pathInfo.changedPaths,
    docsAppChangedPaths: pathInfo.docsAppChangedPaths,
    touchesCode: pathInfo.touchesCode,
    violations: [],
    warnings: [],
  };

  if (!pathInfo.required) {
    return result;
  }

  result.verdict = "failed";
  const bodyText = String(body || "");
  const maxBytes = Number(config.max_body_bytes || 262144);
  if (Buffer.byteLength(bodyText, "utf8") > maxBytes) {
    result.violations.push(
      violation("MANIFEST-BODY-SIZE", `PR body exceeds max_body_bytes (${maxBytes}).`)
    );
    return result;
  }

  const manifest = parseManifest(bodyText, config);

  if (!manifest.hasMarker || manifest.markerVersion !== manifest.expectedVersion) {
    result.violations.push(
      violation(
        "MANIFEST-001",
        `Missing marker <!-- ${config.marker || "PR-CHANGE-MANIFEST"}:v${manifest.expectedVersion} -->.`
      )
    );
  }

  if (!manifest.hasClassification) {
    result.violations.push(violation("MANIFEST-002", "Missing ## Classification section."));
  }
  if (!manifest.hasBehaviorDelta) {
    result.violations.push(violation("MANIFEST-003", "Missing ## Behavior delta section."));
  }
  if (!manifest.hasDocsImpact) {
    result.violations.push(violation("MANIFEST-004", "Missing ## Docs impact section."));
  }
  if (!manifest.hasTestEvidence) {
    result.violations.push(violation("MANIFEST-005", "Missing ## Test evidence section."));
  }
  if (!manifest.hasConfirmation) {
    result.violations.push(violation("MANIFEST-006", "Missing ## Confirmation section."));
  }

  if (!["yes", "no"].includes(manifest.productBehaviorChange)) {
    result.violations.push(
      violation("MANIFEST-007", "Classification.Product behavior change must be yes or no.")
    );
  }

  const allowedStages = config.allowed_stages || [];
  if (!allowedStages.includes(manifest.changeStage)) {
    result.violations.push(
      violation(
        "MANIFEST-008",
        `Classification.Change stage must be one of: ${allowedStages.join(", ")}.`
      )
    );
  }

  const allowedVerdicts = config.allowed_sync_verdicts || [];
  if (!allowedVerdicts.includes(manifest.syncVerdict)) {
    result.violations.push(
      violation(
        "MANIFEST-009",
        `Classification.Sync verdict must be one of: ${allowedVerdicts.join(", ")}.`
      )
    );
  }

  const docsPathsInDiff = new Set(pathInfo.docsAppChangedPaths);
  const claimedDocsPaths = manifest.docsPaths.filter((item) => isDocsAppPath(item, config));
  const claimedDocsInDiff = claimedDocsPaths.filter((item) => docsPathsInDiff.has(item));
  const hasDocsClaim = claimedDocsInDiff.length > 0;
  const hasNoDocsReason = meaningful(manifest.noDocsImpactReason);

  if (!hasDocsClaim && !hasNoDocsReason) {
    result.violations.push(
      violation(
        "DOCS-001",
        "Docs impact requires changed docs/app paths present in the PR diff, or No docs impact reason."
      )
    );
  }

  for (const claimed of claimedDocsPaths) {
    if (!docsPathsInDiff.has(claimed)) {
      result.violations.push(
        violation(
          "DOCS-002",
          `Claimed docs path is not in the PR diff: ${claimed}.`
        )
      );
    }
  }

  const allowedResults = new Set(config.allowed_test_results || []);
  const validTestRows = [];
  for (const row of manifest.testRows) {
    if (!meaningful(row.command) || !meaningful(row.coverage)) {
      result.violations.push(
        violation("TEST-001", "Each test evidence row needs Command and Coverage.")
      );
      continue;
    }
    if (!allowedResults.has(row.result)) {
      result.violations.push(
        violation(
          "TEST-002",
          `Test result "${row.result}" is invalid. Use: ${[...allowedResults].join(", ")}.`
        )
      );
      continue;
    }
    if (row.result === "fail") {
      result.violations.push(
        violation("TEST-003", `Test evidence reports fail for command: ${row.command}.`)
      );
      continue;
    }
    validTestRows.push(row);
  }

  if (validTestRows.length === 0) {
    result.violations.push(
      violation("TEST-004", "Test evidence requires at least one valid table row.")
    );
  }

  if (!manifest.confirmations.sync || !manifest.confirmations.docs || !manifest.confirmations.tests) {
    result.violations.push(
      violation(
        "CONFIRM-001",
        "All three Confirmation checkboxes must be checked."
      )
    );
  }

  if (manifest.productBehaviorChange === "yes") {
    if (manifest.syncVerdict !== "ready_for_write") {
      result.violations.push(
        violation(
          "SYNC-001",
          "Product behavior change = yes requires Sync verdict = ready_for_write."
        )
      );
    }
    if (!meaningful(manifest.authority)) {
      result.violations.push(violation("SYNC-002", "Authority is required when behavior changes."));
    }
    if (!meaningful(manifest.syncResultReference)) {
      result.violations.push(
        violation("SYNC-003", "Sync result reference is required when behavior changes.")
      );
    }
    if (!meaningful(manifest.before) || !meaningful(manifest.after) || !meaningful(manifest.unchangedGuardrails)) {
      result.violations.push(
        violation(
          "DELTA-001",
          "Behavior delta requires Before, After, and Unchanged guardrails when behavior changes."
        )
      );
    }

    const requiresPass =
      manifest.changeStage === "implemented" || pathInfo.touchesCode;
    if (requiresPass && !validTestRows.some((row) => row.result === "pass")) {
      result.violations.push(
        violation(
          "TEST-005",
          "Behavior change with stage=implemented or code paths requires at least one test row with result=pass."
        )
      );
    }
  }

  if (manifest.productBehaviorChange === "no") {
    if (!meaningful(manifest.noBehaviorChangeReason)) {
      result.violations.push(
        violation(
          "DELTA-002",
          "No behavior change reason is required when Product behavior change = no."
        )
      );
    }
    if (!["skip", "not-applicable"].includes(manifest.syncVerdict)) {
      result.violations.push(
        violation(
          "SYNC-004",
          "Product behavior change = no requires Sync verdict skip or not-applicable."
        )
      );
    }
    if (pathInfo.touchesCode && !validTestRows.some((row) => row.result === "pass")) {
      result.violations.push(
        violation(
          "TEST-006",
          "Code PR with no behavior change still requires at least one test row with result=pass."
        )
      );
    }
    if (
      !pathInfo.touchesCode &&
      pathInfo.docsAppChangedPaths.length > 0 &&
      !validTestRows.some((row) => ["pass", "not-required"].includes(row.result))
    ) {
      result.violations.push(
        violation(
          "TEST-007",
          "Docs-app-only PR may use result=not-required or pass, but must include a valid test evidence row."
        )
      );
    }
  }

  if (result.violations.length === 0) {
    result.verdict = "passed";
  }

  return result;
}

function parseArgs(argv) {
  const args = {
    bodyFile: null,
    filesFile: null,
    config: DEFAULT_CONFIG_PATH,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--body-file") {
      args.bodyFile = argv[++index];
    } else if (token === "--files-file") {
      args.filesFile = argv[++index];
    } else if (token === "--config") {
      args.config = argv[++index];
    } else if (token === "--json") {
      args.json = true;
    } else if (token === "--help" || token === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      "Usage:",
      "  node scripts/verify/pr-change-manifest.js --body-file <path> --files-file <path> [--config <path>] [--json]",
      "",
      "Exit codes:",
      "  0 pass or skip",
      "  1 manifest violations",
      "  2 usage/config/input error",
      "",
    ].join("\n")
  );
}

function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    printHelp();
    process.exitCode = 2;
    return;
  }

  if (args.help) {
    printHelp();
    process.exitCode = 0;
    return;
  }

  if (!args.bodyFile || !args.filesFile) {
    process.stderr.write("Both --body-file and --files-file are required.\n");
    printHelp();
    process.exitCode = 2;
    return;
  }

  let config;
  let body;
  let files;
  try {
    config = loadConfig(args.config);
    body = fs.readFileSync(args.bodyFile, "utf8");
    files = JSON.parse(fs.readFileSync(args.filesFile, "utf8"));
    if (!Array.isArray(files)) {
      throw new Error("files-file must contain a JSON array.");
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
    return;
  }

  const result = validateManifest(body, files, config);
  if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.verdict === "skipped") {
    process.stdout.write(
      `PR change manifest skipped (no trigger paths). Changed files: ${result.changedPaths.length}.\n`
    );
  } else if (result.verdict === "passed") {
    process.stdout.write(
      `PR change manifest passed. Matched paths: ${result.matchedPaths.join(", ") || "(none)"}.\n`
    );
  } else {
    process.stderr.write("PR change manifest failed:\n");
    for (const item of result.violations) {
      process.stderr.write(`- ${item.id}: ${item.message}\n`);
    }
  }

  process.exitCode = result.verdict === "failed" ? 1 : 0;
}

if (require.main === module) {
  main();
}

module.exports = {
  DEFAULT_CONFIG_PATH,
  loadConfig,
  evaluatePathTrigger,
  parseManifest,
  validateManifest,
  collectChangedPaths,
  isTriggeredPath,
  isCodePath,
  isDocsAppPath,
  normalizePath,
  stripHtmlComments,
  main,
};
