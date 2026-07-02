const { AppError } = require("../../../http/errors/AppError");
const { createAnomalyRepository } = require("../infrastructure/AnomalyRepository");

function getAnomaly({ config, anomalyId }) {
  const anomaly = createAnomalyRepository({ config }).findById(anomalyId);
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
  getAnomaly,
};
