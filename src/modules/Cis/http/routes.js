const express = require("express");

const IssuesController = require("./controllers/IssuesController");

function createCisRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.get("/issues", IssuesController.list);
  router.get("/issues/:issueId/editor", IssuesController.editor);
  router.patch("/issues/:issueId", IssuesController.updateCanonical);
  router.post("/issues/:issueId/translations/:queueId/translate", IssuesController.translateQueueItem);
  router.post("/issues/:issueId/translations/translate", IssuesController.translate);
  router.get("/issues/:issueId/history", IssuesController.history);
  router.get("/issues/:issueId/worklogs", IssuesController.worklogs);
  router.get("/issues/:issueId", IssuesController.show);
  router.get("/issues/:issueId/attachments", IssuesController.attachments);
  router.post("/issues/:issueId/force-approve", IssuesController.forceApprove);
  router.post("/issues/:issueId/mark-duplicate", IssuesController.markDuplicate);
  router.get("/projects/:projectId/issues", IssuesController.list);

  return router;
}

module.exports = {
  createCisRouter,
};
