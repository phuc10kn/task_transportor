const express = require("express");

const TranslationIssueController = require("./controllers/TranslationIssueController");
const TranslationQueueController = require("./controllers/TranslationQueueController");

function createTranslationRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.post("/translations/issues/:issueId/translate", TranslationIssueController.translateIssue);
  router.post(
    "/translations/issues/:issueId/items/:queueId/translate",
    TranslationIssueController.translateQueueItem
  );
  router.get("/translation-queue", TranslationQueueController.list);
  router.get("/translation-queue/:queueId", TranslationQueueController.show);
  router.post("/translation-queue/:queueId/approve", TranslationQueueController.approve);
  router.post("/translation-queue/:queueId/reject", TranslationQueueController.reject);
  router.post("/translation-queue/:queueId/retranslate", TranslationQueueController.retranslate);
  router.post("/translation-queue/:queueId/manual-edit", TranslationQueueController.manualEdit);

  return router;
}

module.exports = {
  createTranslationRouter,
};
