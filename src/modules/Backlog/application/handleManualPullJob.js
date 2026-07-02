const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const ProjectsApi = require("../../Projects/ProjectsApi");
const SyncApi = require("../../Sync/SyncApi");
const { createBacklogClient } = require("../infrastructure/BacklogClient");
const { downloadAttachmentToCis } = require("./downloadAttachmentToCis");
const { normalizeBacklogIssue } = require("../support/normalizeBacklogIssue");

function retryableFromError(error) {
  if (error.statusCode === 429 || error.statusCode >= 500) {
    return true;
  }

  if (error.code === "ENOTFOUND" || error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
    return true;
  }

  return false;
}

async function handleManualPullJob(job, { config }) {
  const backlogIssueKey = job.payload_json && job.payload_json.backlog_issue_key;
  if (!backlogIssueKey) {
    throw new AppError({
      code: "BACKLOG_PULL_PAYLOAD_INVALID",
      message: "manual_pull job requires payload_json.backlog_issue_key.",
      status: 422,
    });
  }

  const project = ProjectsApi.getProject({ config, projectId: job.project_id });
  const client = createBacklogClient({ config, project });

  try {
    const [issue, comments, attachments] = await Promise.all([
      client.getIssue(backlogIssueKey),
      client.getIssueComments(backlogIssueKey),
      client.getIssueAttachments(backlogIssueKey),
    ]);

    const normalized = normalizeBacklogIssue({
      project,
      issue,
      comments,
      attachments,
    });

    if (normalized.backlog_project_key && project.backlog_project_key && normalized.backlog_project_key !== project.backlog_project_key) {
      throw new AppError({
        code: "BACKLOG_ROUTING_MISMATCH",
        message: "Backlog issue belongs to a different project.",
        status: 422,
        details: {
          expected: project.backlog_project_key,
          actual: normalized.backlog_project_key,
        },
      });
    }

    const result = CisApi.upsertBacklogIssue({
      config,
      input: normalized,
    });
    SyncApi.linkJobIssue({
      config,
      jobId: job.id,
      issueId: result.issue.id,
    });

    const attachmentDownloads = [];
    for (const attachment of result.attachments) {
      const download = await downloadAttachmentToCis({
        config,
        attachment,
        project,
        backlogIssueKey: normalized.backlog_issue_key,
      });
      attachmentDownloads.push({
        attachment_id: download.attachment.id,
        backlog_attachment_id: download.attachment.backlog_attachment_id,
        status: download.status,
        stored_path: download.stored_path,
        sha256: download.sha256,
        error_message: download.error_message,
      });
    }

    SyncApi.writeJournal({
      config,
      input: {
        sync_job_id: job.id,
        project_id: project.id,
        issue_id: result.issue.id,
        direction_from: "backlog",
        direction_to: "cis",
        job_type: "manual_pull",
        action: result.created_revision ? "backlog_issue_ingested" : "backlog_issue_skipped_duplicate",
        status: "success",
        trigger: job.payload_json.mode === "scheduled" ? "scheduled" : "manual",
        message: result.created_revision ? "Backlog issue ingested into CIS." : "Backlog issue unchanged; duplicate snapshot skipped.",
        details_json: {
          backlog_issue_key: normalized.backlog_issue_key,
          created_issue: result.created_issue,
          created_revision: result.created_revision,
          comments: result.comments.length,
          attachments: result.attachments.length,
          attachment_downloads: attachmentDownloads,
          created_translation_items: 0,
          translate_jobs: 0,
        },
        attempt_count: job.attempt_count,
      },
    });

    return {
      issue_id: result.issue.id,
      backlog_issue_key: normalized.backlog_issue_key,
      created_issue: result.created_issue,
      created_revision: result.created_revision,
      comments: result.comments.length,
      attachments: result.attachments.length,
      attachment_downloads: attachmentDownloads,
      created_translation_items: 0,
      translate_jobs: 0,
    };
  } catch (error) {
    error.retryable = retryableFromError(error);
    throw error;
  }
}

module.exports = {
  handleManualPullJob,
};
