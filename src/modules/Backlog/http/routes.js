const express = require("express");

const BacklogAttachmentController = require("./controllers/BacklogAttachmentController");
const BacklogPullController = require("./controllers/BacklogPullController");

function createBacklogRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.use("/:projectId/backlog", requireProjectWorkspace);
  router.post("/:projectId/backlog/mapping-values/pull", BacklogPullController.pullMappingValues);
  router.post("/:projectId/backlog/pull", BacklogPullController.pullProject);
  router.get("/:projectId/backlog/issues/action-readiness", BacklogPullController.actionReadiness);
  router.get("/:projectId/backlog/issues/filter-options", BacklogPullController.candidateFilterOptions);
  router.get("/:projectId/backlog/issues/candidates", BacklogPullController.candidates);
  router.post("/:projectId/backlog/manual-pulls/count", BacklogPullController.countFilteredManualPulls);
  router.post("/:projectId/backlog/manual-pulls/pages/:page", BacklogPullController.enqueueFilteredManualPullPage);
  router.post("/:projectId/backlog/issues/:backlogIssueKey/sync-to-cis", BacklogPullController.syncCandidateToCis);
  router.post("/:projectId/backlog/issues/:backlogIssueKey/pull", BacklogPullController.pullIssue);

  return router;
}

function createBacklogAttachmentRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.post("/:projectId/attachments/:attachmentId/retry-download", requireProjectWorkspace, BacklogAttachmentController.retryDownload);

  return router;
}

module.exports = {
  createBacklogAttachmentRouter,
  createBacklogRouter,
};
