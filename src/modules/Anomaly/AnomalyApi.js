const { createAnomaly } = require("./application/createAnomaly");
const { ensureMappingGapAnomaly } = require("./application/ensureMappingGapAnomaly");
const { getAnomaly } = require("./application/getAnomaly");
const { ignoreAnomaly } = require("./application/ignoreAnomaly");
const { listAnomalies } = require("./application/listAnomalies");
const { listBlockingAnomalies } = require("./application/listBlockingAnomalies");
const { resolveAnomaly } = require("./application/resolveAnomaly");

module.exports = {
  createAnomaly,
  ensureMappingGapAnomaly,
  getAnomaly,
  ignoreAnomaly,
  listAnomalies,
  listBlockingAnomalies,
  resolveAnomaly,
};
