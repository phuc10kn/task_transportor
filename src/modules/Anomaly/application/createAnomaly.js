const { AppError } = require("../../../http/errors/AppError");
const { createAnomalyRepository } = require("../infrastructure/AnomalyRepository");

function createAnomaly({ config, input }) {
  const required = ["project_id", "anomaly_type", "severity"];
  const missing = required.filter((field) => input[field] === undefined || input[field] === "");
  if (missing.length > 0) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Anomaly is missing required fields.",
      status: 422,
      details: { missing },
    });
  }

  return createAnomalyRepository({ config }).create(input);
}

module.exports = {
  createAnomaly,
};
