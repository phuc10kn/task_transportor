const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const {
  loadConfig,
  evaluatePathTrigger,
  validateManifest,
  DEFAULT_CONFIG_PATH,
} = require("./pr-change-manifest");

const fixturesDir = path.join(__dirname, "fixtures", "pr-change-manifest");
const config = loadConfig(DEFAULT_CONFIG_PATH);

function readFixture(name) {
  return fs.readFileSync(path.join(fixturesDir, name), "utf8");
}

test("path trigger matches code and docs/app, skips guide-only", () => {
  const code = evaluatePathTrigger([{ filename: "src/modules/Cis/foo.js" }], config);
  assert.equal(code.required, true);
  assert.equal(code.touchesCode, true);

  const docs = evaluatePathTrigger([{ filename: "docs/app/02-product/README.md" }], config);
  assert.equal(docs.required, true);
  assert.deepEqual(docs.docsAppChangedPaths, ["docs/app/02-product/README.md"]);

  const guide = evaluatePathTrigger(
    [{ filename: "docs/guide/workflows/sync-product-change.md" }],
    config
  );
  assert.equal(guide.required, false);

  const mixed = evaluatePathTrigger(
    [
      { filename: "docs/guide/README.md" },
      { filename: "package.json" },
    ],
    config
  );
  assert.equal(mixed.required, true);
});

test("rename and delete of docs/app still trigger", () => {
  const renamed = evaluatePathTrigger(
    [
      {
        filename: "docs/guide/moved.md",
        previous_filename: "docs/app/02-product/README.md",
      },
    ],
    config
  );
  assert.equal(renamed.required, true);
  assert.ok(renamed.docsAppChangedPaths.includes("docs/app/02-product/README.md"));

  const deleted = evaluatePathTrigger(
    [{ filename: "docs/app/08-quality/README.md", status: "removed" }],
    config
  );
  assert.equal(deleted.required, true);
});

test("backlog2jira is excluded even if mixed naming appears", () => {
  const onlyLegacy = evaluatePathTrigger([{ filename: "backlog2jira/foo.js" }], config);
  assert.equal(onlyLegacy.required, false);

  const mixed = evaluatePathTrigger(
    [{ filename: "backlog2jira/foo.js" }, { filename: "src/app.js" }],
    config
  );
  assert.equal(mixed.required, true);
});

test("valid behavior manifest passes", () => {
  const result = validateManifest(
    readFixture("valid-behavior.md"),
    [
      { filename: "src/modules/Backlog/pullIssue.js" },
      { filename: "docs/app/02-product/README.md" },
    ],
    config
  );
  assert.equal(result.verdict, "passed");
  assert.equal(result.violations.length, 0);
});

test("valid no-behavior code refactor passes", () => {
  const result = validateManifest(
    readFixture("valid-no-behavior-code.md"),
    [{ filename: "src/modules/Translation/helpers.js" }],
    config
  );
  assert.equal(result.verdict, "passed");
});

test("valid docs-app-only change passes", () => {
  const result = validateManifest(
    readFixture("valid-docs-app-only.md"),
    [{ filename: "docs/app/02-product/README.md" }],
    config
  );
  assert.equal(result.verdict, "passed");
});

test("guide-only PR skips without body", () => {
  const result = validateManifest("", [{ filename: "docs/guide/README.md" }], config);
  assert.equal(result.verdict, "skipped");
  assert.equal(result.required, false);
});

test("missing sections fail", () => {
  const result = validateManifest(
    "<!-- PR-CHANGE-MANIFEST:v1 -->\n# PR\n",
    [{ filename: "src/app.js" }],
    config
  );
  assert.equal(result.verdict, "failed");
  const ids = result.violations.map((item) => item.id);
  assert.ok(ids.includes("MANIFEST-002"));
  assert.ok(ids.includes("MANIFEST-003"));
  assert.ok(ids.includes("MANIFEST-004"));
  assert.ok(ids.includes("MANIFEST-005"));
  assert.ok(ids.includes("MANIFEST-006"));
});

test("skip sync verdict fails for behavior change", () => {
  const body = readFixture("valid-behavior.md").replace(
    "Sync verdict: ready_for_write",
    "Sync verdict: skip"
  );
  const result = validateManifest(
    body,
    [
      { filename: "src/modules/Backlog/pullIssue.js" },
      { filename: "docs/app/02-product/README.md" },
    ],
    config
  );
  assert.equal(result.verdict, "failed");
  assert.ok(result.violations.some((item) => item.id === "SYNC-001"));
});

test("test fail row fails validation", () => {
  const body = readFixture("valid-behavior.md").replace(
    "| npm run verify:phase03 | pass | inbound pull behavior |",
    "| npm run verify:phase03 | fail | inbound pull behavior |"
  );
  const result = validateManifest(
    body,
    [
      { filename: "src/modules/Backlog/pullIssue.js" },
      { filename: "docs/app/02-product/README.md" },
    ],
    config
  );
  assert.equal(result.verdict, "failed");
  assert.ok(result.violations.some((item) => item.id === "TEST-003"));
});

test("implemented behavior without pass row fails", () => {
  const body = readFixture("valid-behavior.md")
    .replace("| npm run verify:phase03 | pass | inbound pull behavior |", "")
    .replace(
      "| npm run verify:phase06 | pass | outbound Jira behavior |",
      "| npm run verify:phase06 | not-run | outbound Jira behavior |"
    );
  const result = validateManifest(
    body,
    [
      { filename: "src/modules/Backlog/pullIssue.js" },
      { filename: "docs/app/02-product/README.md" },
    ],
    config
  );
  assert.equal(result.verdict, "failed");
  assert.ok(result.violations.some((item) => item.id === "TEST-005"));
});

test("HTML placeholders are treated as empty", () => {
  const body = readFixture("valid-behavior.md")
    .replace("Before: Scope could be read as full bidirectional sync.", "Before: <!-- fill me -->")
    .replace("After: Lite prefers Backlog -> CIS and CIS -> Jira.", "After: <!-- fill me -->");
  const result = validateManifest(
    body,
    [
      { filename: "src/modules/Backlog/pullIssue.js" },
      { filename: "docs/app/02-product/README.md" },
    ],
    config
  );
  assert.equal(result.verdict, "failed");
  assert.ok(result.violations.some((item) => item.id === "DELTA-001"));
});

test("oversized body fails with body-size rule", () => {
  const tinyConfig = {
    ...config,
    max_body_bytes: 32,
  };
  const result = validateManifest(
    "<!-- PR-CHANGE-MANIFEST:v1 -->\n" + "x".repeat(100),
    [{ filename: "src/app.js" }],
    tinyConfig
  );
  assert.equal(result.verdict, "failed");
  assert.ok(result.violations.some((item) => item.id === "MANIFEST-BODY-SIZE"));
});

test("claimed docs path must exist in diff", () => {
  const result = validateManifest(
    readFixture("valid-behavior.md"),
    [{ filename: "src/modules/Backlog/pullIssue.js" }],
    config
  );
  assert.equal(result.verdict, "failed");
  assert.ok(result.violations.some((item) => item.id === "DOCS-002"));
});
