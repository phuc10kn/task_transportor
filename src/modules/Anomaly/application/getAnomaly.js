const { AppError } = require("../../../http/errors/AppError");
const { createAnomalyRepository } = require("../infrastructure/AnomalyRepository");

function getAnomaly({ config, anomalyId, projectId }) {
  const anomaly = createAnomalyRepository({ config }).findById(anomalyId, projectId);
  if (!anomaly) {
    throw new AppError({
      code: projectId === undefined ? "ANOMALY_NOT_FOUND" : "RESOURCE_NOT_FOUND",
      message: "Anomaly not found.",
      status: 404,
    });
  }

  return anomaly;
}

module.exports = {
  getAnomaly,
};
