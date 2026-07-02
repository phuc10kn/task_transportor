const { createMappingRepository } = require("../infrastructure/MappingRepository");

function listMappingRules({ config, filters = {} }) {
  return createMappingRepository({ config }).list(filters);
}

module.exports = {
  listMappingRules,
};
