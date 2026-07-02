const { createAnomalyRepository } = require("../infrastructure/AnomalyRepository");

function listBlockingAnomalies({ config, issueId }) {
  return createAnomalyRepository({ config }).findBlockingForIssue(issueId);
}

module.exports = {
  listBlockingAnomalies,
};
