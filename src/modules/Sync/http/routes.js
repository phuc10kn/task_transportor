const express = require("express");

const SyncJobsController = require("./controllers/SyncJobsController");
const SyncJournalController = require("./controllers/SyncJournalController");

function createSyncRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.get("/sync-jobs", SyncJobsController.list);
  router.post("/sync-jobs", SyncJobsController.create);
  router.get("/sync-jobs/:jobId", SyncJobsController.show);
  router.post("/sync-jobs/:jobId/retry", SyncJobsController.retry);
  router.post("/sync-jobs/:jobId/cancel", SyncJobsController.cancel);
  router.get("/sync-journal", SyncJournalController.list);
  router.get("/issues/:issueId/sync-journal", SyncJournalController.list);

  return router;
}

module.exports = {
  createSyncRouter,
};
