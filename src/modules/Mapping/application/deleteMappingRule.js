const { AppError } = require("../../../http/errors/AppError");
const { createMappingRepository } = require("../infrastructure/MappingRepository");

function deleteMappingRule({ config, ruleId }) {
  const removed = createMappingRepository({ config }).remove(ruleId);
  if (!removed) {
    throw new AppError({
      code: "MAPPING_RULE_NOT_FOUND",
      message: "Mapping rule not found.",
      status: 404,
    });
  }

  return { deleted: true };
}

module.exports = {
  deleteMappingRule,
};
