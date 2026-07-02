const { createCisRepository } = require("../infrastructure/CisRepository");

function addRevision({ config, input }) {
  return createCisRepository({ config }).addRevision(input);
}

module.exports = {
  addRevision,
};
