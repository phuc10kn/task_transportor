const { updateProject } = require("./updateProject");

function setProjectSyncEnabled({ config, projectId, enabled }) {
  return updateProject({
    config,
    projectId,
    input: { sync_enabled: enabled },
  });
}

module.exports = {
  setProjectSyncEnabled,
};
