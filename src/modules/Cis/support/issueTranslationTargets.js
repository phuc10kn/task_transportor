const { getFieldSourceValues } = require("./resolveCanonicalField");

const ISSUE_TRANSLATION_FIELDS = Object.freeze(["summary", "description"]);

function normalizeTranslationSource(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function issueTranslationTargets(issue) {
  return ISSUE_TRANSLATION_FIELDS
    .map((field) => {
      const sources = getFieldSourceValues(issue.fields_json, field);
      return {
        field,
        value: sources.backlog,
      };
    })
    .filter((target) => normalizeTranslationSource(target.value));
}

function issueTranslationTargetMap(issue) {
  return issueTranslationTargets(issue).reduce((map, target) => {
    map[target.field] = normalizeTranslationSource(target.value);
    return map;
  }, {});
}

module.exports = {
  ISSUE_TRANSLATION_FIELDS,
  issueTranslationTargetMap,
  issueTranslationTargets,
  normalizeTranslationSource,
};
