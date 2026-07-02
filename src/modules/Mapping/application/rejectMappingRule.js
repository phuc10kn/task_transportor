const { AppError } = require("../../../http/errors/AppError");
const { createMappingRepository } = require("../infrastructure/MappingRepository");

function rejectMappingRule({ config, ruleId, rejectedReason }) {
  const rule = createMappingRepository({ config }).reject(ruleId, {
    rejected_reason: rejectedReason,
  });
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
  rejectMappingRule,
};
