const { createCisRepository } = require("../infrastructure/CisRepository");

function listIssues({ config, filters = {} }) {
  return createCisRepository({ config }).listIssues(filters);
}

module.exports = {
  listIssues,
};
