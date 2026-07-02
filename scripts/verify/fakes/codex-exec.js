const fs = require("fs");
const path = require("path");

let stdin = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  stdin += chunk;
});

process.stdin.on("end", () => {
  const mode = process.argv[2] || "success";

  if (mode === "timeout") {
    setTimeout(() => {}, 60 * 1000);
    return;
  }

  if (mode === "invalid-json") {
    process.stdout.write("not-json");
    return;
  }

  if (mode === "exit-error") {
    process.stderr.write("fake codex_exec failure");
    process.exit(2);
    return;
  }

  if (mode === "fail-once") {
    const markerPath = process.argv[3] ||
      process.env.CODEX_EXEC_FAIL_ONCE_MARKER ||
      path.join(process.cwd(), "storage", "codex-exec-fail-once.marker");
    if (!fs.existsSync(markerPath)) {
      fs.mkdirSync(path.dirname(markerPath), { recursive: true });
      fs.writeFileSync(markerPath, "failed");
      process.stderr.write("fake codex_exec transient failure");
      process.exit(2);
      return;
    }
  }

  const request = JSON.parse(stdin || "{}");
  const confidence = mode === "low-confidence" ? 0.2 : 0.82;

  process.stdout.write(JSON.stringify({
    translated_text: `[vi] ${request.source_text || ""}`,
    confidence,
    warnings: mode === "low-confidence" ? ["low_confidence_fixture"] : [],
    preserved_blocks: true,
  }));
});
