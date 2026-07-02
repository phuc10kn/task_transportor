const { AppError } = require("../../../http/errors/AppError");
const { createMappingRepository } = require("../infrastructure/MappingRepository");

function getMappingRule({ config, ruleId }) {
  const rule = createMappingRepository({ config }).findById(ruleId);
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
  getMappingRule,
};
