const express = require("express");

const JiraDryRunController = require("./controllers/JiraDryRunController");
const JiraMappingValuesController = require("./controllers/JiraMappingValuesController");
const JiraSyncController = require("./controllers/JiraSyncController");

function createJiraRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.post("/projects/:projectId/jira/mapping-values/pull", JiraMappingValuesController.pull);
  router.post("/issues/:issueId/dry-run/jira", JiraDryRunController.dryRun);
  router.post("/issues/:issueId/sync/jira", JiraSyncController.sync);

  return router;
}

module.exports = {
  createJiraRouter,
};
