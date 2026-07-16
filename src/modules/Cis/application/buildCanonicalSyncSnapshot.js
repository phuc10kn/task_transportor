const { EDITABLE_CANONICAL_FIELDS } = require("../support/canonicalIssueFields");
const { hashCanonicalIssue } = require("../support/hashCanonicalIssue");
const { resolveCanonicalField } = require("../support/resolveCanonicalField");

function latestRevisionFallback(revision, field) {
  return revision ? revision[field] : undefined;
}

function buildCanonicalSyncSnapshot({ issue, revision, overrides = null }) {
  const canonical = {};
  const fieldSources = {};

  for (const field of EDITABLE_CANONICAL_FIELDS) {
    canonical[field] = resolveCanonicalField(
      issue.fields_json,
      field,
      latestRevisionFallback(revision, field)
    );
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, field)) {
      canonical[field] = {
        ...canonical[field],
        value: overrides[field],
        source: "cis",
      };
    }
    fieldSources[field] = canonical[field].source;
  }

  return {
    canonical,
    field_sources: fieldSources,
    canonical_hash: hashCanonicalIssue({ canonical, issue }),
  };
}

module.exports = {
  buildCanonicalSyncSnapshot,
};
