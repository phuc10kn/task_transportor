const { createCisRepository } = require("../infrastructure/CisRepository");

function getIssueByBacklogKey({ config, projectId, backlogIssueKey }) {
  return createCisRepository({ config }).getIssueByBacklogKey(projectId, backlogIssueKey);
}

module.exports = {
  getIssueByBacklogKey,
};
