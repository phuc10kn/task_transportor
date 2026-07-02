const CisApi = require("../../Cis/CisApi");
const ProjectsApi = require("../../Projects/ProjectsApi");
const { createAttachmentStorage } = require("../infrastructure/AttachmentStorage");
const { createBacklogClient } = require("../infrastructure/BacklogClient");

async function downloadAttachmentToCis({ config, attachment, project, backlogIssueKey }) {
  const resolvedProject = project || ProjectsApi.getProject({
    config,
    projectId: attachment.project_id,
  });
  const client = createBacklogClient({ config, project: resolvedProject });
  const storage = createAttachmentStorage({ config });

  try {
    const downloaded = await client.downloadAttachment(
      backlogIssueKey,
      attachment.backlog_attachment_id
    );
    const saved = storage.save({
      projectId: resolvedProject.id,
      issueId: attachment.issue_id,
      attachmentId: attachment.id,
      filename: attachment.original_filename,
      body: downloaded.body,
    });
    const updatedAttachment = CisApi.markAttachmentDownloaded({
      config,
      attachmentId: attachment.id,
      input: {
        ...saved,
        mime_type: downloaded.contentType,
      },
    });

    return {
      attachment: updatedAttachment,
      status: "downloaded",
      stored_path: updatedAttachment.stored_path,
      sha256: updatedAttachment.sha256,
    };
  } catch (error) {
    const updatedAttachment = CisApi.markAttachmentDownloadFailed({
      config,
      attachmentId: attachment.id,
      errorMessage: error.message,
    });

    return {
      attachment: updatedAttachment,
      status: "failed",
      error_message: updatedAttachment.error_message,
    };
  }
}

module.exports = {
  downloadAttachmentToCis,
};
