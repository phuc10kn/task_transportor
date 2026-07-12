const { createCisRepository } = require("../infrastructure/CisRepository");

function getIssuesByBacklogKeys({ config, projectId, backlogIssueKeys }) {
  return createCisRepository({ config }).getIssuesByBacklogKeys(Number(projectId), backlogIssueKeys);
}

module.exports = { getIssuesByBacklogKeys };
