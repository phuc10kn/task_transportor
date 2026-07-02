const { createCisRepository } = require("../infrastructure/CisRepository");

function upsertBacklogIssue({ config, input }) {
  return createCisRepository({ config }).upsertBacklogIssue(input);
}

module.exports = {
  upsertBacklogIssue,
};
