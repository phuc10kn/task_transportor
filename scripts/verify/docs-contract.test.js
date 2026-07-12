const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  parseFrontmatter,
  parseRequiredSections,
  parseRelationTemplate,
  normalizeHeading,
  hasHeading,
  createDocsContractContext,
} = require("./lib/docs-contract");
const { validateEntityInstances } = require("./entity-instance");
const { validateRelations } = require("./relations");
const { validateReferences } = require("./references");

const repositoryRoot = path.resolve(__dirname, "..", "..");

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function createMiniRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "docs-contract-"));
  writeFile(
    path.join(root, "docs/meta/01-entity-types/01-business/04-behavior/01-processes/processes/process.md"),
    `# Process

| Field | Value |
|-------|-------|
| **name** | Process |
| **layer** | \`01-business\` |
| **concern** | \`04-behavior\` |
| **folder** | \`processes/\` |
| **ID pattern** | \`PROC-{NNN}\` |
| **Instance folder pattern** | \`PROC-{NNN}-{slug}\` |
| **schema** | \`entity-instance/v1\` |

## structure extends

Base: \`entity-instance/v1\`

Required sections:

- \`Trigger\`
- \`Participants\`
- \`Steps\`
- \`Outcomes\`

## relations_template

Không có outbound slot active.
`
  );

  writeFile(
    path.join(
      root,
      "docs/meta/01-entity-types/01-business/05-governance/01-business-rules/business-rules/business-rule.md"
    ),
    `# BusinessRule

| Field | Value |
|-------|-------|
| **name** | BusinessRule |
| **layer** | \`01-business\` |
| **concern** | \`05-governance\` |
| **folder** | \`business-rules/\` |
| **ID pattern** | \`BRULE-{NNN}\` |
| **Instance folder pattern** | \`BRULE-{NNN}-{slug}\` |
| **schema** | \`entity-instance/v1\` |

## structure extends

Base: \`entity-instance/v1\`

Required sections:

- \`Statement\`
- \`Condition\`
- \`Outcome\`
- \`Scope\`

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| governs | \`governs\` | Process | allowed_when_known | 0..n |
`
  );

  writeFile(
    path.join(root, "docs/meta/03-rules/01-business/valid-triples.md"),
    `| Source | Relation | Target | Cardinality |
|--------|----------|--------|-------------|
| BusinessRule | \`governs\` | Process | 0..n |
`
  );

  writeFile(
    path.join(root, "docs/theories/README.md"),
    `| \`TH-HUBFLOW\` | Hub | active |\n| \`TH-HUBFLOW-01\` | Position | active |\n`
  );
  writeFile(
    path.join(root, "docs/theories/hub/theory.md"),
    "### `TH-HUBFLOW-01` - No bypass\n"
  );
  writeFile(
    path.join(root, "docs/app/10-decisions/01-decision-making/01-decisions/DEC-001-example/README.md"),
    `---
schema: decision/v1
id: DEC-001
slug: example
title: Example
status: accepted
summary: Example decision.
---

# DEC-001 - Example
`
  );

  const processBody = `---
schema: entity-instance/v1
id: PROC-001
slug: sample-process
title: Sample Process
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Sample process.
theory_basis:
  - TH-HUBFLOW
  - TH-HUBFLOW-01
decision_basis:
  - DEC-001
---

# PROC-001 - Sample Process

## Summary

Sample.

## Meaning

Meaning.

## Trigger

Trigger.

## Participants

Participants.

## Steps

Steps.

## Outcomes

Outcomes.

## Relations

None outbound.

## Validation Notes

Ok.
`;

  writeFile(
    path.join(
      root,
      "docs/app/01-business/04-behavior/01-processes/processes/PROC-001-sample-process/README.md"
    ),
    processBody
  );

  writeFile(
    path.join(
      root,
      "docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-001-sample-rule/README.md"
    ),
    `---
schema: entity-instance/v1
id: BRULE-001
slug: sample-rule
title: Sample Rule
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Sample rule.
relations:
  governs:
    - PROC-001
---

# BRULE-001 - Sample Rule

## Summary

Sample.

## Meaning

Meaning.

## Statement

Must.

## Condition

When.

## Outcome

Then.

## Scope

Scope.

## Relations

governs PROC-001.

## Validation Notes

Ok.
`
  );

  return root;
}

test("frontmatter parser reads relations and lists", () => {
  const parsed = parseFrontmatter(`---
schema: entity-instance/v1
theory_basis:
  - TH-HUBFLOW
relations:
  owns:
    - SO-001
---

# Body
`);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.data.theory_basis, ["TH-HUBFLOW"]);
  assert.deepEqual(parsed.data.relations.owns, ["SO-001"]);
});

test("required sections parser supports EN and VI", () => {
  const english = parseRequiredSections("Required sections:\n\n- `Trigger`\n\nOptional sections:\n\n- `Inputs`\n");
  assert.deepEqual(english, ["Trigger"]);
  const vietnamese = parseRequiredSections(
    "Section bắt buộc:\n\n- Responsibility\n\nSection tùy chọn:\n\n- Evidence\n"
  );
  assert.deepEqual(vietnamese, ["Responsibility"]);
});

test("relation template parser reads requirement mode", () => {
  const slots = parseRelationTemplate(
    "| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |\n| --- | --- | --- | --- | --- |\n| governs | `governs` | Process | allowed_when_known | 0..n |\n"
  );
  assert.equal(slots.get("governs").targetType, "Process");
  assert.equal(slots.get("governs").requirementMode, "allowed_when_known");
});

test("heading matcher allows elaborating prefix", () => {
  assert.equal(normalizeHeading("Why this unit matters"), "why this unit matters");
  assert.equal(
    hasHeading("# X\n\n## Why this unit matters architecturally\n", "Why this unit matters"),
    true
  );
});

test("entity-instance pass and missing Trigger fail", () => {
  const root = createMiniRepo();
  const pass = validateEntityInstances({
    repositoryRoot: root,
    instances: [
      path.join(
        root,
        "docs/app/01-business/04-behavior/01-processes/processes/PROC-001-sample-process/README.md"
      ),
    ],
  });
  assert.equal(pass.verdict, "passed");

  const failPath = path.join(
    root,
    "docs/app/01-business/04-behavior/01-processes/processes/PROC-002-missing-trigger/README.md"
  );
  writeFile(
    failPath,
    `---
schema: entity-instance/v1
id: PROC-002
slug: missing-trigger
title: Missing Trigger
entity_type: Process
layer: 01-business
concern: 04-behavior
status: draft
summary: Missing trigger.
---

# PROC-002 - Missing Trigger

## Summary
x
## Meaning
x
## Participants
x
## Steps
x
## Outcomes
x
## Relations
x
## Validation Notes
x
`
  );

  const fail = validateEntityInstances({
    repositoryRoot: root,
    instances: [failPath],
  });
  assert.equal(fail.verdict, "failed");
  assert.ok(fail.violations.some((item) => item.id === "EINS-006" && item.message.includes("Trigger")));
});

test("relations pass governs and fail unknown slot", () => {
  const root = createMiniRepo();
  const pass = validateRelations({
    repositoryRoot: root,
    instances: [
      path.join(
        root,
        "docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-001-sample-rule/README.md"
      ),
    ],
  });
  assert.equal(pass.verdict, "passed");

  const badPath = path.join(
    root,
    "docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-002-bad-slot/README.md"
  );
  writeFile(
    badPath,
    `---
schema: entity-instance/v1
id: BRULE-002
slug: bad-slot
title: Bad Slot
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Bad slot.
relations:
  unknown_slot:
    - PROC-001
---

# BRULE-002 - Bad Slot

## Summary
x
## Meaning
x
## Statement
x
## Condition
x
## Outcome
x
## Scope
x
## Relations
x
## Validation Notes
x
`
  );

  const fail = validateRelations({ repositoryRoot: root, instances: [badPath] });
  assert.equal(fail.verdict, "failed");
  assert.ok(fail.violations.some((item) => item.id === "REL-001"));
});

test("relations fail missing target and process outbound", () => {
  const root = createMiniRepo();
  const missingTarget = path.join(
    root,
    "docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-003-missing-target/README.md"
  );
  writeFile(
    missingTarget,
    `---
schema: entity-instance/v1
id: BRULE-003
slug: missing-target
title: Missing Target
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Missing target.
relations:
  governs:
    - PROC-999
---

# BRULE-003 - Missing Target

## Summary
x
## Meaning
x
## Statement
x
## Condition
x
## Outcome
x
## Scope
x
## Relations
x
## Validation Notes
x
`
  );
  const failTarget = validateRelations({ repositoryRoot: root, instances: [missingTarget] });
  assert.ok(failTarget.violations.some((item) => item.id === "REL-002"));

  const processOutbound = path.join(
    root,
    "docs/app/01-business/04-behavior/01-processes/processes/PROC-003-outbound/README.md"
  );
  writeFile(
    processOutbound,
    `---
schema: entity-instance/v1
id: PROC-003
slug: outbound
title: Outbound
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Outbound.
relations:
  governs:
    - PROC-001
---

# PROC-003 - Outbound

## Summary
x
## Meaning
x
## Trigger
x
## Participants
x
## Steps
x
## Outcomes
x
## Relations
x
## Validation Notes
x
`
  );
  const failOutbound = validateRelations({ repositoryRoot: root, instances: [processOutbound] });
  assert.ok(failOutbound.violations.some((item) => item.id === "REL-001"));
});

test("references pass and fail unknown theory/decision/note-candidate", () => {
  const root = createMiniRepo();
  const pass = validateReferences({
    repositoryRoot: root,
    instances: [
      path.join(
        root,
        "docs/app/01-business/04-behavior/01-processes/processes/PROC-001-sample-process/README.md"
      ),
    ],
  });
  assert.equal(pass.verdict, "passed");

  const bad = path.join(
    root,
    "docs/app/01-business/04-behavior/01-processes/processes/PROC-004-bad-ref/README.md"
  );
  writeFile(
    bad,
    `---
schema: entity-instance/v1
id: PROC-004
slug: bad-ref
title: Bad Ref
entity_type: Process
layer: 01-business
concern: 04-behavior
status: draft
summary: Bad refs.
theory_basis:
  - TH-FAKE-99
  - NOTE-CANDIDATE
decision_basis:
  - DEC-999
---

# PROC-004 - Bad Ref

## Summary
x
## Meaning
x
## Trigger
x
## Participants
x
## Steps
x
## Outcomes
x
## Relations
x
## Validation Notes
x
`
  );
  const fail = validateReferences({ repositoryRoot: root, instances: [bad] });
  assert.equal(fail.verdict, "failed");
  const ids = fail.violations.map((item) => item.id);
  assert.ok(ids.includes("REF-001"));
  assert.ok(ids.includes("REF-002"));
});

test("architecture layer pilot has no violations", () => {
  const entity = validateEntityInstances({
    repositoryRoot,
    layer: "05-architecture",
  });
  const relations = validateRelations({
    repositoryRoot,
    layer: "05-architecture",
  });
  const references = validateReferences({
    repositoryRoot,
    layer: "05-architecture",
  });
  assert.equal(entity.verdict, "passed");
  assert.equal(relations.verdict, "passed");
  assert.equal(references.verdict, "passed");
  assert.equal(entity.summary.checked, 42);
});

test("docs contract context loads registries", () => {
  const context = createDocsContractContext(repositoryRoot);
  assert.ok(context.registry.byTypeName.has("Module"));
  assert.ok(context.tripleRegistry.triples.has("Module|owns|StateOwner"));
  assert.ok(context.theoryIndex.ids.has("TH-MODULAR"));
  assert.ok(context.decisionIndex.byId.has("DEC-002"));
});
