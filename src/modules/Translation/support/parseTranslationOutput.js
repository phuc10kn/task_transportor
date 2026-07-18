const { AppError } = require("../../../http/errors/AppError");

function parseTranslationOutput(output) {
  let parsed;
  try {
    parsed = JSON.parse(String(output || "").trim());
  } catch (_error) {
    throw new AppError({
      code: "TRANSLATION_AI_PARSE_ERROR",
      message: "Translation AI output was not valid JSON.",
      status: 502,
    });
  }

  if (!parsed || typeof parsed.translated_text !== "string" || !parsed.translated_text.trim()) {
    throw new AppError({
      code: "TRANSLATION_AI_INVALID_OUTPUT",
      message: "Translation AI output must include translated_text.",
      status: 502,
    });
  }

  return {
    translated_text: parsed.translated_text.trim(),
    confidence: Number.isFinite(Number(parsed.confidence)) ? Number(parsed.confidence) : null,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    preserved_blocks: parsed.preserved_blocks === undefined ? null : parsed.preserved_blocks,
  };
}

module.exports = { parseTranslationOutput };
