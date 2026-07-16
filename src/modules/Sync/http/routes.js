const express = require("express");

const SyncJobsController = require("./controllers/SyncJobsController");
const SyncJournalController = require("./controllers/SyncJournalController");

function createSyncRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.use("/projects/:projectId", requireProjectWorkspace);
  router.get("/projects/:projectId/sync-jobs", SyncJobsController.list);
  router.post("/projects/:projectId/sync-jobs", SyncJobsController.create);
  router.get("/projects/:projectId/sync-jobs/:jobId", SyncJobsController.show);
  router.post("/projects/:projectId/sync-jobs/:jobId/retry", SyncJobsController.retry);
  router.post("/projects/:projectId/sync-jobs/:jobId/cancel", SyncJobsController.cancel);
  router.get("/projects/:projectId/sync-journal", SyncJournalController.list);
  router.get("/projects/:projectId/issues/:issueId/sync-journal", SyncJournalController.list);

  return router;
}

module.exports = {
  createSyncRouter,
};
