const { createMappingRepository } = require("../infrastructure/MappingRepository");

function findApprovedMappingRule({ config, input }) {
  return createMappingRepository({ config }).findApproved(input);
}

module.exports = {
  findApprovedMappingRule,
};
