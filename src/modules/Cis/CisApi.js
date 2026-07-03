const { addRevision } = require("./application/addRevision");
const { applyReviewedCommentTranslation } = require("./application/applyReviewedCommentTranslation");
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
const { markCommentJiraSynced } = require("./application/markCommentJiraSynced");
const { markCommentJiraSyncFailed } = require("./application/markCommentJiraSyncFailed");
const { markDuplicateIssue } = require("./application/markDuplicateIssue");
const { markIssueConflict } = require("./application/markIssueConflict");
const { markIssueSyncStatus } = require("./application/markIssueSyncStatus");
const {
  markAttachmentDownloaded,
  markAttachmentDownloadFailed,
} = require("./application/markAttachmentDownloaded");
const { saveJiraDraftFields } = require("./application/saveJiraDraftFields");
const { saveJiraSyncResult } = require("./application/saveJiraSyncResult");
const { updateCanonicalIssue } = require("./application/updateCanonicalIssue");
const { upsertBacklogIssue } = require("./application/upsertBacklogIssue");

module.exports = {
  addRevision,
  applyReviewedCommentTranslation,
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
  markCommentJiraSynced,
  markCommentJiraSyncFailed,
  markDuplicateIssue,
  markIssueConflict,
  markIssueSyncStatus,
  markAttachmentDownloaded,
  markAttachmentDownloadFailed,
  saveJiraDraftFields,
  saveJiraSyncResult,
  updateCanonicalIssue,
  upsertBacklogIssue,
};
