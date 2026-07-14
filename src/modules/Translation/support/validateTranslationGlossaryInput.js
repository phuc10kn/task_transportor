const { AppError } = require("../../../http/errors/AppError");

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeTextKey(value) {
  return String(value === null || value === undefined ? "" : value).trim().toLowerCase();
}

function assertPositiveInteger(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: `${field} must be a positive integer.`,
      status: 422,
      details: { field },
    });
  }

  return parsed;
}

function normalizeGlossaryInput(input) {
  if (!isPlainObject(input)) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Translation glossary payload must be an object.",
      status: 422,
    });
  }

  const groupKey = String(input.group_key === null || input.group_key === undefined ? "" : input.group_key)
    .trim()
    .toLowerCase() || "default";
  const conceptKey = String(input.concept_key === null || input.concept_key === undefined ? "" : input.concept_key)
    .trim()
    .toLowerCase();

  if (!conceptKey) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "concept_key is required.",
      status: 422,
      details: { field: "concept_key" },
    });
  }

  if (!Array.isArray(input.terms) || input.terms.length === 0) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "terms must contain at least one item.",
      status: 422,
      details: { field: "terms" },
    });
  }

  const variants = new Set();
  const canonicalByLanguage = new Map();
  const terms = input.terms.map((entry, index) => {
    if (!isPlainObject(entry)) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Each term must be an object.",
        status: 422,
        details: { field: `terms[${index}]` },
      });
    }

    const languageCode = String(entry.language_code === null || entry.language_code === undefined ? "" : entry.language_code)
      .trim()
      .toLowerCase();
    const term = String(entry.term === null || entry.term === undefined ? "" : entry.term).trim();
    const isCanonical = entry.is_canonical;

    if (!languageCode) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "language_code is required.",
        status: 422,
        details: { field: `terms[${index}].language_code` },
      });
    }

    if (!term) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "term is required.",
        status: 422,
        details: { field: `terms[${index}].term` },
      });
    }

    if (typeof isCanonical !== "boolean") {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "is_canonical must be a boolean.",
        status: 422,
        details: { field: `terms[${index}].is_canonical` },
      });
    }

    const termMatchKey = normalizeTextKey(term);
    const variantKey = `${languageCode}\u0000${termMatchKey}`;
    if (variants.has(variantKey)) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "A normalized term can appear only once per language.",
        status: 422,
        details: { field: "terms" },
      });
    }
    variants.add(variantKey);
    if (isCanonical) {
      if (canonicalByLanguage.has(languageCode)) {
        throw new AppError({
          code: "VALIDATION_ERROR",
          message: "Each language must have exactly one canonical term.",
          status: 422,
          details: { field: "terms.is_canonical" },
        });
      }
      canonicalByLanguage.set(languageCode, true);
    }
    return { language_code: languageCode, term, is_canonical: isCanonical };
  });

  for (const languageCode of new Set(terms.map((term) => term.language_code))) {
    if (!canonicalByLanguage.has(languageCode)) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Each language must have exactly one canonical term.",
        status: 422,
        details: { field: "terms.is_canonical" },
      });
    }
  }

  const note = input.note === null || input.note === undefined
    ? null
    : String(input.note).trim() || null;

  return {
    group_key: groupKey,
    concept_key: conceptKey,
    note,
    terms,
  };
}

module.exports = {
  assertPositiveInteger,
  normalizeTextKey,
  normalizeGlossaryInput,
};
