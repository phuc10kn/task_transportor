const assert = require("assert");
const { loadGraph, parseArguments, traceGraph } = require("../architecture-trace");

const graph = loadGraph();

const moduleTrace = traceGraph(graph, {
  from: "MOD-007",
  direction: "both",
  depth: 1,
});
for (const expected of [
  "AF-006|involves|MOD-007|derived_reverse",
  "AF-007|involves|MOD-007|derived_reverse",
  "MB-006|constrains|MOD-007|derived_reverse",
  "DU-001|hosts|MOD-007|derived_reverse",
]) {
  assert(
    moduleTrace.edges.some((edge) => `${edge.source}|${edge.relation}|${edge.target}|${edge.direction}` === expected),
    `Expected module trace edge: ${expected}`
  );
}

const stateTrace = traceGraph(graph, {
  from: "SO-001",
  relation: "changes",
  direction: "reverse",
  depth: 1,
});
assert.deepStrictEqual(
  new Set(stateTrace.edges.map((edge) => edge.source)),
  new Set(["AF-001", "AF-004", "AF-005", "AF-007"]),
  "SO-001 reverse changes trace must derive every flow that can change it"
);

assert.deepStrictEqual(
  parseArguments(["--from", "SO-001", "--relation", "changes", "--reverse"]),
  { from: "SO-001", relation: "changes", direction: "reverse", depth: 1, format: "text" },
  "CLI arguments must preserve reverse-derived query intent"
);

console.log("Architecture trace verification passed.");
