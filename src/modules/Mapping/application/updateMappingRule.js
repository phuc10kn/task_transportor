const { AppError } = require("../../../http/errors/AppError");
const { createMappingRepository } = require("../infrastructure/MappingRepository");

const ALLOWED_UPDATE_FIELDS = new Set([
  "mapping_type",
  "direction_from",
  "direction_to",
  "from_value",
  "to_value",
  "confidence",
  "source_type",
  "approval_status",
]);

function updateMappingRule({ config, ruleId, input }) {
  const patch = {};
  for (const [key, value] of Object.entries(input || {})) {
    if (ALLOWED_UPDATE_FIELDS.has(key)) {
      patch[key] = value;
    }
  }

  const rule = createMappingRepository({ config }).update(ruleId, patch);
  if (!rule) {
    throw new AppError({
      code: "MAPPING_RULE_NOT_FOUND",
      message: "Mapping rule not found.",
      status: 404,
    });
  }

  return rule;
}

module.exports = {
  updateMappingRule,
};
