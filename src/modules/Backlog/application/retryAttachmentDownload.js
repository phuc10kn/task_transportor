const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { downloadAttachmentToCis } = require("./downloadAttachmentToCis");

async function retryAttachmentDownload({ config, attachmentId, executedBy, correlationId }) {
  const attachment = CisApi.getAttachmentById({ config, attachmentId });

  if (attachment.source_system !== "backlog" || !attachment.backlog_attachment_id) {
    throw new AppError({
      code: "ATTACHMENT_RETRY_UNSUPPORTED",
      message: "Only Backlog attachments can be retried by this endpoint.",
      status: 422,
    });
  }

  const issue = CisApi.getIssueById({ config, issueId: attachment.issue_id });
  const result = await downloadAttachmentToCis({
    config,
    attachment,
    backlogIssueKey: issue.backlog_issue_key,
  });

  SyncApi.writeJournal({
    config,
    input: {
      project_id: attachment.project_id,
      issue_id: attachment.issue_id,
      attachment_id: attachment.id,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      action: "attachment_download_retry",
      status: result.status === "downloaded" ? "success" : "failed",
      trigger: "manual",
      message: result.status === "downloaded"
        ? "Attachment downloaded to CIS storage."
        : "Attachment download retry failed.",
      details_json: {
        attachment_id: attachment.id,
        backlog_attachment_id: attachment.backlog_attachment_id,
        stored_path: result.stored_path,
        sha256: result.sha256,
      },
      error_message: result.error_message,
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });

  return result.attachment;
}

module.exports = {
  retryAttachmentDownload,
};
