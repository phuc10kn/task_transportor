const express = require("express");

const BacklogAttachmentController = require("./controllers/BacklogAttachmentController");
const BacklogPullController = require("./controllers/BacklogPullController");

function createBacklogRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.post("/:projectId/backlog/mapping-values/pull", BacklogPullController.pullMappingValues);
  router.post("/:projectId/backlog/pull", BacklogPullController.pullProject);
  router.post("/:projectId/backlog/issues/:backlogIssueKey/pull", BacklogPullController.pullIssue);

  return router;
}

function createBacklogAttachmentRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.post("/:attachmentId/retry-download", BacklogAttachmentController.retryDownload);

  return router;
}

module.exports = {
  createBacklogAttachmentRouter,
  createBacklogRouter,
};
