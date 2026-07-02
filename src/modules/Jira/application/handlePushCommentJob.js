const { AppError } = require("../../../http/errors/AppError");
const SyncApi = require("../../Sync/SyncApi");
const { createJiraClient } = require("../infrastructure/JiraClient");
const { createJiraSyncRepository } = require("../infrastructure/JiraSyncRepository");

async function handlePushCommentJob(job, { config }) {
  const repository = createJiraSyncRepository({ config });
  const bundle = repository.getIssueBundle(job.issue_id);
  if (!bundle) {
    throw new AppError({
      code: "ISSUE_NOT_FOUND",
      message: "Issue not found for Jira comment sync.",
      status: 404,
    });
  }

  const comment = bundle.comments.find((item) => item.id === job.comment_id);
  if (!comment) {
    throw new AppError({
      code: "COMMENT_NOT_FOUND",
      message: "Comment not found for Jira sync.",
      status: 404,
    });
  }

  if (comment.jira_comment_id && comment.sync_status === "synced") {
    return {
      skipped: true,
      comment_id: comment.id,
      jira_comment_id: comment.jira_comment_id,
    };
  }

  if (!bundle.issue.jira_issue_key) {
    throw new AppError({
      code: "JIRA_ISSUE_LINK_REQUIRED",
      message: "Issue must be linked to Jira before syncing comments.",
      status: 422,
    });
  }

  if (!comment.content_translated || !String(comment.content_translated).trim()) {
    throw new AppError({
      code: "COMMENT_TRANSLATION_REQUIRED",
      message: "Comment translation must be reviewed before Jira sync.",
      status: 422,
    });
  }

  try {
    const client = createJiraClient({
      config,
      project: bundle.project,
    });
    const created = await client.addComment(bundle.issue.jira_issue_key, comment.content_translated);
    const synced = repository.markCommentSynced(comment.id, created.id || created.commentId || null);

    SyncApi.writeJournal({
      config,
      input: {
        sync_job_id: job.id,
        project_id: bundle.project.id,
        issue_id: bundle.issue.id,
        comment_id: comment.id,
        direction_from: "cis",
        direction_to: "jira",
        job_type: "push_comment",
        action: "comment_added",
        status: "success",
        trigger: "system",
        message: "Reviewed comment synced to Jira.",
        details_json: {
          jira_issue_key: bundle.issue.jira_issue_key,
          jira_comment_id: synced.jira_comment_id,
        },
        attempt_count: job.attempt_count,
      },
    });

    return {
      comment_id: comment.id,
      jira_comment_id: synced.jira_comment_id,
      jira_issue_key: bundle.issue.jira_issue_key,
    };
  } catch (error) {
    repository.markCommentFailed(comment.id);
    SyncApi.writeJournal({
      config,
      input: {
        sync_job_id: job.id,
        project_id: bundle.project.id,
        issue_id: bundle.issue.id,
        comment_id: comment.id,
        direction_from: "cis",
        direction_to: "jira",
        job_type: "push_comment",
        action: "comment_sync_failed",
        status: "failed",
        trigger: "system",
        message: error.message,
        error_message: error.message,
        attempt_count: job.attempt_count,
      },
    });
    throw error;
  }
}

module.exports = {
  handlePushCommentJob,
};
