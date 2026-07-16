const { approveTranslation } = require("./application/approveTranslation");
const { approveTranslationBatch } = require("./application/approveTranslationBatch");
const { buildStandardTranslationInput } = require("./application/buildStandardTranslationInput");
const { collectTranslationContext } = require("./application/collectTranslationContext");
const { createTranslationGlossaryConcept } = require("./application/createTranslationGlossaryConcept");
const { deleteTranslationGlossaryConcept } = require("./application/deleteTranslationGlossaryConcept");
const { getTranslationQueueItem } = require("./application/getTranslationQueueItem");
const { handleTranslateJob } = require("./application/handleTranslateJob");
const { enqueueIssueTranslations } = require("./application/enqueueIssueTranslations");
const { listTranslationGlossary } = require("./application/listTranslationGlossary");
const { listTranslationQueue } = require("./application/listTranslationQueue");
const { saveTranslationDraft } = require("./application/saveTranslationDraft");
const { rejectTranslation } = require("./application/rejectTranslation");
const { rollbackTranslationBatch } = require("./application/rollbackTranslationBatch");
const { requestIssueTranslations } = require("./application/requestIssueTranslations");
const { retranslateTranslation } = require("./application/retranslateTranslation");
const { syncIssueTranslationState } = require("./application/syncIssueTranslationState");
const { translateIssueTranslationNow } = require("./application/translateIssueTranslationNow");
const { translateQueueItemNow } = require("./application/translateQueueItemNow");
const { updateTranslationGlossaryConcept } = require("./application/updateTranslationGlossaryConcept");

module.exports = {
  approveTranslation,
  approveTranslationBatch,
  buildStandardTranslationInput,
  collectTranslationContext,
  createTranslationGlossaryConcept,
  deleteTranslationGlossaryConcept,
  enqueueIssueTranslations,
  getTranslationQueueItem,
  handleTranslateJob,
  listTranslationGlossary,
  listTranslationQueue,
  saveTranslationDraft,
  rejectTranslation,
  rollbackTranslationBatch,
  requestIssueTranslations,
  retranslateTranslation,
  syncIssueTranslationState,
  translateIssueTranslationNow,
  translateQueueItemNow,
  updateTranslationGlossaryConcept,
};
