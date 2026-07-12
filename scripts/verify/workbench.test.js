const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { verifyWorkbench, validateItemFile, parseFrontmatter } = require("./workbench");

const fixturesDir = path.join(__dirname, "fixtures", "workbench");

test("activation and empty registry pass", () => {
  const result = verifyWorkbench();
  assert.equal(result.ok, true);
});

test("valid intake fixture parses and validates", () => {
  const filePath = path.join(fixturesDir, "valid-intake.md");
  const errors = [];
  validateItemFile(filePath, errors);
  assert.deepEqual(errors, []);
  const data = parseFrontmatter(fs.readFileSync(filePath, "utf8"));
  assert.equal(data.id, "WB-CIS-0001");
  assert.equal(data.status, "intake");
});

test("missing owner fixture fails", () => {
  const filePath = path.join(fixturesDir, "invalid-missing-owner.md");
  const errors = [];
  validateItemFile(filePath, errors);
  assert.ok(errors.some((error) => /owner is required/.test(error)));
});

test("temporary items dir with valid fixture passes scoped verify", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "wb-verify-"));
  fs.copyFileSync(
    path.join(fixturesDir, "valid-intake.md"),
    path.join(tempDir, "wb-cis-0001.md")
  );
  const result = verifyWorkbench({ itemsDir: tempDir });
  assert.equal(result.ok, true);
  assert.equal(result.itemCount, 1);
});
