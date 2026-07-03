const { addRevision } = require("./application/addRevision");
const { applyReviewedIssueTranslation } = require("./application/applyReviewedIssueTranslation");
const { buildCanonicalSyncSnapshot } = require("./application/buildCanonicalSyncSnapshot");
const { createIssue } = require("./application/createIssue");
const { createTranslationQueueItem } = require("./application/createTranslationQueueItem");
const { forceApproveIssue } = require("./application/forceApproveIssue");
const { getAttachmentById } = require("./application/getAttachmentById");
const { getIssueDetail } = require("./application/getIssueDetail");
const { getIssueEditor } = require("./application/getIssueEditor");
const { getIssueTranslationTargets } = require("./application/getIssueTranslationTargets");
const { getIssueById } = require("./application/getIssueById");
const { getIssueByBacklogKey } = require("./application/getIssueByBacklogKey");
const { listIssueHistory } = require("./application/listIssueHistory");
const { listIssueWorklogs } = require("./application/listIssueWorklogs");
const { listIssueChildren } = require("./application/listIssueChildren");
const { listIssues } = require("./application/listIssues");
const { markDuplicateIssue } = require("./application/markDuplicateIssue");
const {
  markAttachmentDownloaded,
  markAttachmentDownloadFailed,
} = require("./application/markAttachmentDownloaded");
const { updateCanonicalIssue } = require("./application/updateCanonicalIssue");
const { upsertBacklogIssue } = require("./application/upsertBacklogIssue");

async function requestIssueTranslations(input) {
  const TranslationApi = require("../Translation/TranslationApi");
  return TranslationApi.requestIssueTranslations(input);
}

async function translateIssueTranslationNow(input) {
  const TranslationApi = require("../Translation/TranslationApi");
  return TranslationApi.translateIssueTranslationNow(input);
}

module.exports = {
  addRevision,
  applyReviewedIssueTranslation,
  buildCanonicalSyncSnapshot,
  createIssue,
  createTranslationQueueItem,
  forceApproveIssue,
  getAttachmentById,
  getIssueDetail,
  getIssueEditor,
  getIssueTranslationTargets,
  getIssueById,
  getIssueByBacklogKey,
  listIssueHistory,
  listIssueWorklogs,
  listIssueChildren,
  listIssues,
  markDuplicateIssue,
  requestIssueTranslations,
  translateIssueTranslationNow,
  markAttachmentDownloaded,
  markAttachmentDownloadFailed,
  updateCanonicalIssue,
  upsertBacklogIssue,
};
