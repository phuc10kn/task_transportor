const express = require("express");

const IssuesController = require("./controllers/IssuesController");

function createCisRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.use("/projects/:projectId/issues", requireProjectWorkspace);
  router.get("/projects/:projectId/issues", IssuesController.list);
  router.post("/projects/:projectId/issues", IssuesController.create);
  router.get("/projects/:projectId/issues/:issueId/editor", IssuesController.editor);
  router.patch("/projects/:projectId/issues/:issueId", IssuesController.updateCanonical);
  router.post("/projects/:projectId/issues/:issueId/external-identities", IssuesController.linkExternalIdentities);
  router.post("/projects/:projectId/issues/:issueId/translations/:queueId/translate", IssuesController.translateQueueItem);
  router.post("/projects/:projectId/issues/:issueId/translations/translate", IssuesController.translate);
  router.get("/projects/:projectId/issues/:issueId/history", IssuesController.history);
  router.get("/projects/:projectId/issues/:issueId/worklogs", IssuesController.worklogs);
  router.get("/projects/:projectId/issues/:issueId", IssuesController.show);
  router.get("/projects/:projectId/issues/:issueId/attachments", IssuesController.attachments);
  router.post("/projects/:projectId/issues/:issueId/force-approve", IssuesController.forceApprove);
  router.post("/projects/:projectId/issues/:issueId/mark-duplicate", IssuesController.markDuplicate);

  return router;
}

module.exports = {
  createCisRouter,
};
