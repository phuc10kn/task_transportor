const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const workbenchRoot = path.join(repositoryRoot, "docs", "workbench", "cis");
const itemsDir = path.join(workbenchRoot, "items");
const policyPath = path.join(workbenchRoot, "policy.md");
const decisionPath = path.join(
  repositoryRoot,
  "docs",
  "app",
  "10-decisions",
  "01-decision-making",
  "01-decisions",
  "DEC-003-workbench-activation-policy",
  "README.md"
);

const ACTIVE_STATUSES = new Set([
  "intake",
  "triaged",
  "modeling",
  "in_review",
  "ready_for_promotion",
]);
const TERMINAL_STATUSES = new Set(["promoted", "rejected", "superseded", "expired"]);
const ALL_STATUSES = new Set([...ACTIVE_STATUSES, ...TERMINAL_STATUSES]);
const SOURCE_TYPES = new Set([
  "idea",
  "code_observation",
  "incident_evidence",
  "product_question",
  "implementation_gap",
]);
const UNCERTAINTY_TYPES = new Set(["canonical_home", "contract", "modeling", "evidence"]);
const ID_PATTERN = /^WB-CIS-\d{4}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return null;
  }

  const data = {};
  let currentListKey = null;
  let currentObjectKey = null;
  let currentObject = null;

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.replace(/\t/g, "  ");
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentListKey) {
      if (!Array.isArray(data[currentListKey])) {
        data[currentListKey] = [];
      }
      data[currentListKey].push(listMatch[1].replace(/^['"]|['"]$/g, ""));
      continue;
    }

    const objectField = line.match(/^\s{2}([A-Za-z0-9_]+):\s*(.*)$/);
    if (objectField && currentObjectKey) {
      currentObject[objectField[1]] = objectField[2].replace(/^['"]|['"]$/g, "");
      data[currentObjectKey] = currentObject;
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      continue;
    }

    currentListKey = null;
    currentObjectKey = null;
    currentObject = null;

    const key = kv[1];
    const value = kv[2];
    if (value === "" || value === "[]") {
      if (value === "[]") {
        data[key] = [];
      } else {
        currentObjectKey = key;
        currentObject = {};
        currentListKey = key;
        data[key] = data[key] || [];
      }
      continue;
    }

    data[key] = value.replace(/^['"]|['"]$/g, "");
  }

  return data;
}

function displayPath(filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function validateActivation(errors) {
  if (!fs.existsSync(decisionPath)) {
    errors.push("missing DEC-003 activation decision");
    return;
  }
  const decision = read(decisionPath);
  if (!/^status:\s*accepted\s*$/m.test(decision) && !/\nstatus:\s*accepted\s*\n/.test(decision)) {
    errors.push("DEC-003 must have status accepted");
  }
  if (!fs.existsSync(policyPath)) {
    errors.push("missing docs/workbench/cis/policy.md");
  }
  if (!fs.existsSync(path.join(itemsDir, "README.md"))) {
    errors.push("missing docs/workbench/cis/items/README.md");
  }
  if (!fs.existsSync(path.join(workbenchRoot, "templates", "work-item.md"))) {
    errors.push("missing work-item template");
  }
}

function validateItemFile(filePath, errors) {
  const markdown = read(filePath);
  const data = parseFrontmatter(markdown);
  const rel = displayPath(filePath);

  if (!data) {
    errors.push(`${rel}: missing YAML frontmatter`);
    return;
  }

  const id = data.id;
  if (!ID_PATTERN.test(id || "")) {
    errors.push(`${rel}: id must match WB-CIS-NNNN`);
  }

  const expectedName = `${String(id || "").toLowerCase()}.md`;
  const underItemsDir = /[\\/]items[\\/]/i.test(filePath);
  if (underItemsDir && path.basename(filePath) !== expectedName) {
    errors.push(`${rel}: filename must be ${expectedName}`);
  }

  if (String(data.policy_version) !== "1") {
    errors.push(`${rel}: policy_version must be 1`);
  }

  if (!ALL_STATUSES.has(data.status)) {
    errors.push(`${rel}: invalid status ${data.status}`);
  }

  if (!SOURCE_TYPES.has(data.source_type)) {
    errors.push(`${rel}: invalid source_type ${data.source_type}`);
  }

  const ownerValue = data.owner;
  if (
    ownerValue == null ||
    typeof ownerValue === "object" ||
    !String(ownerValue).trim() ||
    String(ownerValue).trim() === "[]"
  ) {
    errors.push(`${rel}: owner is required`);
  }

  for (const field of ["created_at", "updated_at", "review_by", "expires_at"]) {
    if (!DATE_PATTERN.test(data[field] || "")) {
      errors.push(`${rel}: ${field} must be YYYY-MM-DD`);
    }
  }

  const uncertaintyType = data.uncertainty && data.uncertainty.type;
  if (!UNCERTAINTY_TYPES.has(uncertaintyType)) {
    errors.push(`${rel}: uncertainty.type is required/valid`);
  }

  if (!Array.isArray(data.source_refs) || data.source_refs.length === 0) {
    // allow empty array literal from parser miss; check raw
    if (!/source_refs:\s*\[.+\]/.test(markdown) && !/source_refs:\s*\n\s*- /.test(markdown)) {
      errors.push(`${rel}: source_refs must be non-empty`);
    }
  }

  if (data.status === "ready_for_promotion" || data.status === "promoted") {
    const targets = data.handoff && data.handoff.canonical_targets;
    const hasTarget =
      (Array.isArray(targets) && targets.length === 1) ||
      /handoff:[\s\S]*canonical_targets:\s*\n\s*-\s+\S+/.test(markdown) ||
      /canonical_targets:\s*\[[^\]]+\]/.test(markdown);
    if (!hasTarget && !(data.candidate_destinations && data.candidate_destinations.length === 1)) {
      // check candidate_destinations single entry in raw
      const destMatches = markdown.match(/candidate_destinations:\s*\n(?:\s*-\s+.+\n)+/);
      if (!(destMatches && destMatches[0].split("\n").filter((l) => /^\s*- /.test(l)).length === 1)) {
        errors.push(`${rel}: ready_for_promotion/promoted requires exactly one canonical destination`);
      }
    }
  }

  if (TERMINAL_STATUSES.has(data.status)) {
    if (!data.disposition || !data.disposition.result) {
      if (!/disposition:[\s\S]*result:\s*\S+/.test(markdown)) {
        errors.push(`${rel}: terminal item requires disposition.result`);
      }
    }
  }
}

function collectItemFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }
  return fs
    .readdirSync(directoryPath)
    .filter((name) => /^wb-cis-\d{4}\.md$/i.test(name))
    .map((name) => path.join(directoryPath, name));
}

function verifyWorkbench(options = {}) {
  const errors = [];
  validateActivation(errors);

  const itemFiles = options.itemsDir
    ? collectItemFiles(options.itemsDir)
    : collectItemFiles(itemsDir);

  for (const filePath of itemFiles) {
    validateItemFile(filePath, errors);
  }

  return {
    ok: errors.length === 0,
    errors,
    itemCount: itemFiles.length,
  };
}

function main() {
  const result = verifyWorkbench();
  if (!result.ok) {
    console.error("verify:workbench failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Workbench verification passed (${result.itemCount} item file(s); activation/policy/registry structural checks).`
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyWorkbench,
  parseFrontmatter,
  validateItemFile,
};
