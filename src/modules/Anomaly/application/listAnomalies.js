const { createAnomalyRepository } = require("../infrastructure/AnomalyRepository");

function listAnomalies({ config, filters = {} }) {
  return createAnomalyRepository({ config }).list(filters);
}

module.exports = {
  listAnomalies,
};
