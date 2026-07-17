const { AppError } = require("../../../http/errors/AppError");

function jiraApi() { return require("../../Jira/JiraApi"); }
function translationApi() { return require("../../Translation/TranslationApi"); }

function stagedCanonical(items) {
  return Object.fromEntries(items.map((item) => [item.target_field, item.ai_draft]));
}

async function runCandidateJiraWorkflow({ config, parentJob, issueId, translationResult, externalAccessScope }) {
  const queueIds = translationResult.current_items.map((item) => item.id);
  const snapshots = translationResult.current_items.map((item) => ({ ...item }));
  const actor = parentJob.payload_json?.requested_by || null;
  const correlationId = parentJob.payload_json?.request_correlation_id || null;
  const original = jiraApi().evaluateJiraSyncReadiness({ config, issueId }).canonical;
  let canonicalCommitted = false;

  try {
    for (const queueId of queueIds) {
      await translationApi().translateQueueItemNow({
        config,
        queueId,
        executedBy: actor,
        correlationId,
        syncJobId: parentJob.id,
        attemptCount: parentJob.attempt_count,
        trigger: "auto",
        maxImmediateAttempts: 2,
      });
    }

    const translatedItems = queueIds.map((queueId) =>
      translationApi().getTranslationQueueItem({ config, queueId, projectId: parentJob.project_id })
    );
    if (translatedItems.some((item) => !String(item.ai_draft || "").trim())) {
      const error = new AppError({
        code: "TRANSLATION_BATCH_INCOMPLETE",
        message: "Every translation field must finish before Jira delivery.",
        status: 422,
        details: { queue_ids: queueIds },
      });
      error.retryable = false;
      throw error;
    }

    const dryRun = jiraApi().runJiraDryRun({
      config,
      issueId,
      executedBy: actor,
      correlationId,
      canonicalOverrides: stagedCanonical(translatedItems),
      syncJobId: parentJob.id,
    });
    if (!dryRun.can_sync) {
      const error = new AppError({
        code: "JIRA_DRY_RUN_BLOCKED",
        message: "Jira dry-run blocked automatic delivery.",
        status: 422,
        details: { validation: dryRun.validation, warnings: dryRun.warnings },
      });
      error.retryable = false;
      throw error;
    }

    const batch = translationApi().approveTranslationBatch({
      config,
      queueIds,
      reviewedBy: actor,
      correlationId,
      parentSyncJobId: parentJob.id,
    });
    canonicalCommitted = true;
    const jira = await jiraApi().handlePushIssueJob({
      ...parentJob,
      issue_id: issueId,
      payload_json: {
        ...parentJob.payload_json,
        canonical_hash: dryRun.canonical_hash,
        suppress_comment_jobs: true,
      },
    }, { config, externalAccessScope });

    return {
      translation_batch: batch,
      jira,
      jira_job: parentJob,
      dry_run: dryRun,
    };
  } catch (error) {
    try {
      translationApi().rollbackTranslationBatch({
        config,
        issueId,
        snapshots,
        canonical: canonicalCommitted ? {
          summary: original.summary.value,
          description: original.description.value,
        } : null,
        executedBy: actor,
        correlationId,
        parentSyncJobId: parentJob.id,
      });
    } catch (rollbackError) {
      error.rollback_error = rollbackError.message;
    }
    throw error;
  }
}

module.exports = { runCandidateJiraWorkflow };
