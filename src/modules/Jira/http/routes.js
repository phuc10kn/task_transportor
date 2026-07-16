const express = require("express");

const JiraDryRunController = require("./controllers/JiraDryRunController");
const JiraMappingValuesController = require("./controllers/JiraMappingValuesController");
const JiraSyncController = require("./controllers/JiraSyncController");

function createJiraRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.post("/projects/:projectId/jira/mapping-values/pull", requireProjectWorkspace, JiraMappingValuesController.pull);
  router.post("/projects/:projectId/issues/:issueId/dry-run/jira", requireProjectWorkspace, JiraDryRunController.dryRun);
  router.post("/projects/:projectId/issues/:issueId/sync/jira", requireProjectWorkspace, JiraSyncController.sync);

  return router;
}

module.exports = {
  createJiraRouter,
};
