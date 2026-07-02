const { addRevision } = require("./application/addRevision");
const { createIssue } = require("./application/createIssue");
const { createTranslationQueueItem } = require("./application/createTranslationQueueItem");
const { forceApproveIssue } = require("./application/forceApproveIssue");
const { getAttachmentById } = require("./application/getAttachmentById");
const { getIssueDetail } = require("./application/getIssueDetail");
const { getIssueEditor } = require("./application/getIssueEditor");
const { getIssueById } = require("./application/getIssueById");
const { getIssueByBacklogKey } = require("./application/getIssueByBacklogKey");
const { listIssueHistory } = require("./application/listIssueHistory");
const { listIssueWorklogs } = require("./application/listIssueWorklogs");
const { listIssueChildren } = require("./application/listIssueChildren");
const { listIssues } = require("./application/listIssues");
const { markDuplicateIssue } = require("./application/markDuplicateIssue");
const { requestIssueTranslations } = require("./application/requestIssueTranslations");
const { translateIssueTranslationNow } = require("./application/translateIssueTranslationNow");
const {
  markAttachmentDownloaded,
  markAttachmentDownloadFailed,
} = require("./application/markAttachmentDownloaded");
const { updateCanonicalIssue } = require("./application/updateCanonicalIssue");
const { upsertBacklogIssue } = require("./application/upsertBacklogIssue");

module.exports = {
  addRevision,
  createIssue,
  createTranslationQueueItem,
  forceApproveIssue,
  getAttachmentById,
  getIssueDetail,
  getIssueEditor,
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
