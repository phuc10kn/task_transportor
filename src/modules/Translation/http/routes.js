const express = require("express");

const TranslationIssueController = require("./controllers/TranslationIssueController");
const TranslationGlossaryController = require("./controllers/TranslationGlossaryController");
const TranslationQueueController = require("./controllers/TranslationQueueController");

function createTranslationRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.get("/projects/:projectId/translation-glossary", TranslationGlossaryController.list);
  router.post("/projects/:projectId/translation-glossary/concepts", TranslationGlossaryController.create);
  router.patch(
    "/projects/:projectId/translation-glossary/concepts/:conceptId",
    TranslationGlossaryController.update
  );
  router.delete(
    "/projects/:projectId/translation-glossary/concepts/:conceptId",
    TranslationGlossaryController.remove
  );
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
  router.put("/translation-queue/:queueId/draft", TranslationQueueController.saveDraft);

  return router;
}

module.exports = {
  createTranslationRouter,
};
