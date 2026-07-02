const { AppError } = require("../../../http/errors/AppError");
const { createMappingRepository } = require("../infrastructure/MappingRepository");

function approveMappingRule({ config, ruleId, approvedBy }) {
  const rule = createMappingRepository({ config }).approve(ruleId, {
    approved_by: approvedBy,
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
  approveMappingRule,
};
