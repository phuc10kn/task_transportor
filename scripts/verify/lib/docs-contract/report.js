function createIssue(id, message, extras = {}) {
  return {
    id,
    message,
    ...extras,
  };
}

function createResult(command, scope) {
  return {
    command,
    scope,
    verdict: "passed",
    summary: {
      checked: 0,
      skipped: 0,
      violations: 0,
      warnings: 0,
    },
    violations: [],
    warnings: [],
    notes: [
      "Structural/reference contract pass does not prove semantic correctness, evidence sufficiency, trace need, product scope, or code-doc alignment.",
    ],
  };
}

function finalizeResult(result) {
  result.summary.violations = result.violations.length;
  result.summary.warnings = result.warnings.length;
  result.verdict = result.violations.length > 0 ? "failed" : "passed";
  return result;
}

function formatTextReport(result) {
  const lines = [];
  if (result.verdict === "failed") {
    lines.push(`${result.command} verification failed:`);
    for (const item of result.violations) {
      const location = item.path ? `${item.path}: ` : "";
      lines.push(`- ${location}${item.id} ${item.message}`);
    }
  } else {
    lines.push(
      `${result.command} verification passed ` +
        `(checked=${result.summary.checked}; skipped=${result.summary.skipped}; warnings=${result.summary.warnings}).`
    );
  }

  if (result.warnings.length > 0) {
    lines.push("Warnings:");
    for (const item of result.warnings) {
      const location = item.path ? `${item.path}: ` : "";
      lines.push(`- ${location}${item.id} ${item.message}`);
    }
  }

  for (const note of result.notes || []) {
    lines.push(`Note: ${note}`);
  }

  return `${lines.join("\n")}\n`;
}

module.exports = {
  createIssue,
  createResult,
  finalizeResult,
  formatTextReport,
};
