const { adfToPlainText } = require("./adfPlainText");
const { DEFAULT_CANONICAL_VALUES } = require("./canonicalIssueFields");

const SOURCE_PRIORITY = Object.freeze(["cis", "backlog", "jira"]);

function normalizeCanonicalValue(field, value) {
  if (field === "description") {
    return adfToPlainText(value);
  }

  return value;
}

function getFieldSourceValues(fieldsJson, field) {
  const entry = fieldsJson && fieldsJson[field];
  const values = {};

  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    for (const source of SOURCE_PRIORITY) {
      if (Object.prototype.hasOwnProperty.call(entry, source)) {
        values[source] = normalizeCanonicalValue(field, entry[source]);
      }
    }
  }

  return values;
}

function resolveCanonicalField(fieldsJson, field, fallbackValue) {
  const sources = getFieldSourceValues(fieldsJson, field);

  for (const source of SOURCE_PRIORITY) {
    if (
      Object.prototype.hasOwnProperty.call(sources, source) &&
      sources[source] !== null &&
      sources[source] !== undefined
    ) {
      return {
        value: sources[source],
        source,
      };
    }
  }

  if (fallbackValue === undefined && Object.prototype.hasOwnProperty.call(DEFAULT_CANONICAL_VALUES, field)) {
    return {
      value: DEFAULT_CANONICAL_VALUES[field],
      source: "default",
    };
  }

  return {
    value: fallbackValue === undefined ? null : fallbackValue,
    source: fallbackValue === undefined ? null : "revision",
  };
}

module.exports = {
  getFieldSourceValues,
  resolveCanonicalField,
};
