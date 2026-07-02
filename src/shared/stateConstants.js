const ISSUE_STATUSES = Object.freeze({
  INGESTED: "ingested",
  PENDING_TRANSLATE: "pending_translate",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  SYNCING: "syncing",
  SYNCED: "synced",
  UPDATE_PENDING: "update_pending",
  CONFLICT: "conflict",
  ARCHIVED: "archived",
});

const TRANSLATION_REVIEW_STATUSES = Object.freeze({
  PENDING: "pending",
  AI_DRAFT: "ai_draft",
  APPROVED: "approved",
  REJECTED: "rejected",
  EDITED: "edited",
});

const SYNC_JOB_STATUSES = Object.freeze({
  PENDING: "pending",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
});

const COMMENT_SYNC_STATUSES = Object.freeze({
  PENDING: "pending",
  SYNCED: "synced",
  SKIPPED: "skipped",
  FAILED: "failed",
});

const ATTACHMENT_DOWNLOAD_STATUSES = Object.freeze({
  PENDING: "pending",
  DOWNLOADED: "downloaded",
  FAILED: "failed",
  SKIPPED: "skipped",
});

const ATTACHMENT_SYNC_STATUSES = Object.freeze({
  PENDING: "pending",
  SYNCED: "synced",
  SKIPPED: "skipped",
  FAILED: "failed",
});

const MAPPING_APPROVAL_STATUSES = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

const ANOMALY_STATUSES = Object.freeze({
  OPEN: "open",
  INVESTIGATING: "investigating",
  RESOLVED: "resolved",
  IGNORED: "ignored",
});

module.exports = {
  ANOMALY_STATUSES,
  ATTACHMENT_DOWNLOAD_STATUSES,
  ATTACHMENT_SYNC_STATUSES,
  COMMENT_SYNC_STATUSES,
  ISSUE_STATUSES,
  MAPPING_APPROVAL_STATUSES,
  SYNC_JOB_STATUSES,
  TRANSLATION_REVIEW_STATUSES,
};
