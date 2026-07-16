const express = require("express");

const TranslationGlossaryController = require("./controllers/TranslationGlossaryController");
const TranslationQueueController = require("./controllers/TranslationQueueController");

function createTranslationRouter({ authenticate, requireProjectWorkspace }) {
  const router = express.Router();

  router.use(authenticate);
  router.use("/projects/:projectId", requireProjectWorkspace);
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
  router.get("/projects/:projectId/translation-queue", TranslationQueueController.list);
  router.get("/projects/:projectId/translation-queue/:queueId", TranslationQueueController.show);
  router.post("/projects/:projectId/translation-queue/:queueId/approve", TranslationQueueController.approve);
  router.post("/projects/:projectId/translation-queue/:queueId/reject", TranslationQueueController.reject);
  router.post("/projects/:projectId/translation-queue/:queueId/retranslate", TranslationQueueController.retranslate);
  router.put("/projects/:projectId/translation-queue/:queueId/draft", TranslationQueueController.saveDraft);

  return router;
}

module.exports = {
  createTranslationRouter,
};
