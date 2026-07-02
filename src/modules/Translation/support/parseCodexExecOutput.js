const { AppError } = require("../../../http/errors/AppError");

function parseCodexExecOutput(stdout) {
  let parsed;

  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    const appError = new AppError({
      code: "CODEX_EXEC_PARSE_ERROR",
      message: "codex_exec output was not valid JSON.",
      status: 502,
    });
    appError.retryable = true;
    throw appError;
  }

  if (!parsed || typeof parsed.translated_text !== "string" || parsed.translated_text.length === 0) {
    const appError = new AppError({
      code: "CODEX_EXEC_INVALID_OUTPUT",
      message: "codex_exec output must include translated_text.",
      status: 502,
    });
    appError.retryable = true;
    throw appError;
  }

  return {
    translated_text: parsed.translated_text,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : null,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    preserved_blocks: parsed.preserved_blocks === undefined ? null : Boolean(parsed.preserved_blocks),
  };
}

module.exports = {
  parseCodexExecOutput,
};
