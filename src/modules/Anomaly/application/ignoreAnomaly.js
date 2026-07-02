const { AppError } = require("../../../http/errors/AppError");
const { createAnomalyRepository } = require("../infrastructure/AnomalyRepository");

function ignoreAnomaly({ config, anomalyId, resolvedBy }) {
  const anomaly = createAnomalyRepository({ config }).transition(anomalyId, {
    status: "ignored",
    resolved_by: resolvedBy,
  });
  if (!anomaly) {
    throw new AppError({
      code: "ANOMALY_NOT_FOUND",
      message: "Anomaly not found.",
      status: 404,
    });
  }

  return anomaly;
}

module.exports = {
  ignoreAnomaly,
};
