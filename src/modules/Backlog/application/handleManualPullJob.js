const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createBacklogClient } = require("../infrastructure/BacklogClient");
const { downloadAttachmentToCis } = require("./downloadAttachmentToCis");
const { normalizeBacklogIssue } = require("../support/normalizeBacklogIssue");
const { applyApprovedBacklogMappings } = require("../support/applyBacklogMappings");
const { runCandidateJiraWorkflow } = require("./runCandidateJiraWorkflow");
const { validateBacklogIssueSnapshot } = require("../support/backlogIssueSnapshot");

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

async function handleManualPullJob(job, { config, externalAccessScope }) {
  const backlogIssueKey = job.payload_json && job.payload_json.backlog_issue_key;
  if (!backlogIssueKey) {
    throw new AppError({
      code: "BACKLOG_PULL_PAYLOAD_INVALID",
      message: "manual_pull job requires payload_json.backlog_issue_key.",
      status: 422,
    });
  }

  const project = projectsApi().getProjectConfig({ config, projectId: job.project_id });
  const client = createBacklogClient({ config, projectId: project.id, externalAccessScope });

  try {
    let issue;
    const snapshot = job.payload_json && job.payload_json.backlog_issue_snapshot;
    if (snapshot) {
      issue = validateBacklogIssueSnapshot(snapshot, { backlogIssueKey, project });
    } else {
      const [backlogProject, fetchedIssue] = await Promise.all([
        client.getProject(project.backlog_project_key),
        client.getIssue(backlogIssueKey),
      ]);
      if (Number(fetchedIssue.projectId) !== Number(backlogProject.id)) {
        throw new AppError({
          code: "BACKLOG_ROUTING_MISMATCH",
          message: "Backlog issue belongs to a different project.",
          status: 422,
        });
      }
      issue = fetchedIssue;
    }

    const [comments, attachments] = await Promise.all([
      client.getIssueComments(backlogIssueKey),
      client.getIssueAttachments(backlogIssueKey),
    ]);

    const rawNormalized = normalizeBacklogIssue({
      project,
      issue,
      comments,
      attachments,
    });
    const mappingResult = applyApprovedBacklogMappings({ config, projectId: project.id, normalized: rawNormalized });
    const normalized = mappingResult.normalized;

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
    const inlineJiraWorkflow = job.job_type === "sync_translate_jira";
    const translationResult = translationRequested
      ? await translationApi().enqueueIssueTranslations({
        config,
        issueId: result.issue.id,
        parentSyncJobId: job.id,
        requestedBy: job.payload_json.requested_by || null,
        requestCorrelationId: job.payload_json.request_correlation_id || null,
        trigger: "manual",
        enqueueJobs: !inlineJiraWorkflow,
      })
      : {
        created_items: [],
        reused_items: [],
        jobs: [],
        reused_jobs: [],
        queue_items: [],
        current_items: [],
      };

    const attachmentDownloads = [];
    for (const attachment of result.attachments) {
      const download = await downloadAttachmentToCis({
        config,
        attachment,
        project,
        externalAccessScope,
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

    const jiraWorkflowResult = job.payload_json?.push_to_jira === true
      ? await runCandidateJiraWorkflow({
        config,
        parentJob: job,
        issueId: result.issue.id,
        translationResult,
        externalAccessScope,
      })
      : null;

    SyncApi.writeJournal({
      config,
      input: {
        sync_job_id: job.id,
        project_id: project.id,
        issue_id: result.issue.id,
        direction_from: "backlog",
        direction_to: inlineJiraWorkflow ? "jira" : "cis",
        job_type: job.job_type,
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
          applied_mappings: mappingResult.applied,
          push_to_jira: Boolean(jiraWorkflowResult),
          jira_job_id: jiraWorkflowResult ? job.id : null,
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
      push_to_jira: Boolean(jiraWorkflowResult),
      jira_job_id: jiraWorkflowResult ? job.id : null,
      jira_issue_key: jiraWorkflowResult
        ? CisApi.getIssueById({ config, issueId: result.issue.id }).jira_issue_key
        : null,
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
