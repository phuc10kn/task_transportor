const { AppError } = require("../../../http/errors/AppError");
const { createMappingRepository } = require("../infrastructure/MappingRepository");

function createMappingRule({ config, input }) {
  const required = ["project_id", "mapping_type", "direction_from", "direction_to", "from_value", "to_value"];
  const missing = required.filter((field) => input[field] === undefined || input[field] === "");
  if (missing.length > 0) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Mapping rule is missing required fields.",
      status: 422,
      details: { missing },
    });
  }

  return createMappingRepository({ config }).create({
    confidence: 1.0,
    source_type: "manual",
    approval_status: "pending",
    ...input,
  });
}

module.exports = {
  createMappingRule,
};
