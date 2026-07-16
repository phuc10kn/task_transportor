const { AppError } = require("../../../http/errors/AppError");
const { createMappingRepository } = require("../infrastructure/MappingRepository");

function getMappingRule({ config, ruleId, projectId }) {
  const rule = createMappingRepository({ config }).findById(ruleId, projectId);
  if (!rule) {
    throw new AppError({
      code: projectId === undefined ? "MAPPING_RULE_NOT_FOUND" : "RESOURCE_NOT_FOUND",
      message: "Mapping rule not found.",
      status: 404,
    });
  }

  return rule;
}

module.exports = {
  getMappingRule,
};
