const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createBacklogClient } = require("../infrastructure/BacklogClient");
const { downloadAttachmentToCis } = require("./downloadAttachmentToCis");
const { normalizeBacklogIssue } = require("../support/normalizeBacklogIssue");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function translationApi() {
  return require("../../Translation/TranslationApi");
}

function retryableFromError(error) {
  const status = Number(error.statusCode || error.status || 0);
  const code = String(error.code || "").toUpperCase();
  if (code.startsWith("SQLITE_BUSY") || code.startsWith("SQLITE_LOCKED")) {
    return true;
  }

  if (status === 429 || status >= 500) {
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

  const project = projectsApi().getProject({ config, projectId: job.project_id });
  const client = createBacklogClient({ config, project });

  try {
    const [backlogProject, issue] = await Promise.all([
      client.getProject(project.backlog_project_key),
      client.getIssue(backlogIssueKey),
    ]);

    if (Number(issue.projectId) !== Number(backlogProject.id)) {
      throw new AppError({
        code: "BACKLOG_ROUTING_MISMATCH",
        message: "Backlog issue belongs to a different project.",
        status: 422,
      });
    }

    const [comments, attachments] = await Promise.all([
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

    const translationRequested = job.payload_json && job.payload_json.with_translation === true;
    const translationResult = translationRequested
      ? await translationApi().enqueueIssueTranslations({
        config,
        issueId: result.issue.id,
        parentSyncJobId: job.id,
        requestedBy: job.payload_json.requested_by || null,
        requestCorrelationId: job.payload_json.request_correlation_id || null,
        trigger: "manual",
      })
      : {
        created_items: [],
        reused_items: [],
        jobs: [],
        reused_jobs: [],
        queue_items: [],
      };

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
          created_translation_items: translationResult.created_items.length,
          reused_translation_items: translationResult.reused_items.length,
          translate_jobs: translationResult.jobs.length,
          reused_translate_jobs: translationResult.reused_jobs.length,
          translation_queue_ids: translationResult.queue_items.map((item) => item.id),
        },
        attempt_count: job.attempt_count,
        executed_by: job.payload_json.requested_by || null,
        correlation_id: job.payload_json.request_correlation_id || null,
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
      created_translation_items: translationResult.created_items.length,
      reused_translation_items: translationResult.reused_items.length,
      translate_jobs: translationResult.jobs.length,
      reused_translate_jobs: translationResult.reused_jobs.length,
      translation_queue_ids: translationResult.queue_items.map((item) => item.id),
    };
  } catch (error) {
    if (error.retryable === undefined) {
      error.retryable = retryableFromError(error);
    }
    throw error;
  }
}

module.exports = {
  handleManualPullJob,
};
