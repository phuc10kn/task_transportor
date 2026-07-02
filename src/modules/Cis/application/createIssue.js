const { createCisRepository } = require("../infrastructure/CisRepository");

function createIssue({ config, input }) {
  return createCisRepository({ config }).createIssue(input);
}

module.exports = {
  createIssue,
};
