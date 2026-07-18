const { updateProject } = require("./updateProject");

function setProjectSyncEnabled({ config, projectId, actorUserId, enabled }) {
  return updateProject({
    config,
    projectId,
    actorUserId,
    input: { sync_enabled: enabled },
  });
}

module.exports = {
  setProjectSyncEnabled,
};
