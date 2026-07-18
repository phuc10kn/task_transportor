const { AppError } = require("../../../http/errors/AppError");
const { createConnection } = require("../../../infrastructure/database/connection");
const { runImmediateTransaction } = require("../../../infrastructure/database/transaction");
const { getLogger } = require("../../../infrastructure/observability/logger");
const SyncApi = require("../../Sync/SyncApi");
const { createCisRepository } = require("../infrastructure/CisRepository");
const { buildCanonicalSyncSnapshot } = require("./buildCanonicalSyncSnapshot");

function prepareJiraSyncJob({ config, issueId, expectedHash, jiraFields, jiraPayloadOverride, targetAction, verifiedTraceKey, executedBy, correlationId, parentSyncJobId = null }) {
  const db = createConnection({ config });
  try {
    const result = runImmediateTransaction(db, () => {
      const repository = createCisRepository({ config, db });
      const issue = repository.getIssueById(issueId);
      if (!issue) throw new AppError({ code: "ISSUE_NOT_FOUND", message: "Issue not found.", status: 404 });
      const revisions = repository.listRevisions(issue.id);
      const revision = revisions[revisions.length - 1] || null;
      const currentHash = buildCanonicalSyncSnapshot({ issue, revision }).canonical_hash;
      const active = SyncApi.hasActiveIssueJobInTransaction({ db, issueId: issue.id, jobType: "push_issue" });
      if (active) {
        const sameHash = active.payload_json && active.payload_json.canonical_hash === currentHash;
        const sameOverride = JSON.stringify(active.payload_json && active.payload_json.jira_payload_override || null) === JSON.stringify(jiraPayloadOverride || null);
        const sameTarget = active.payload_json && active.payload_json.target_action === targetAction
          && (active.payload_json.verified_trace_key || null) === (verifiedTraceKey || null);
        if (sameHash && sameOverride && sameTarget) return { job: active, reused: true, canonical_hash: currentHash };
        throw new AppError({ code: "JIRA_SYNC_STALE", message: "Active Jira sync job is incompatible with this request.", status: 409 });
      }
      if (currentHash !== expectedHash) {
        throw new AppError({ code: "DRY_RUN_STALE", message: "Canonical issue changed before Jira sync preparation.", status: 422 });
      }

      const updated = Object.keys(jiraFields || {}).length > 0
        ? repository.saveJiraDraftFieldsInTransaction(issue.id, jiraFields)
        : issue;
      const h1 = buildCanonicalSyncSnapshot({ issue: updated, revision }).canonical_hash;
      let preparedIssue = updated;
      if (verifiedTraceKey) {
        const key = String(verifiedTraceKey).trim().toUpperCase();
        const owners = repository.getIssuesByJiraKey(issue.project_id, key);
        if (owners.length > 1) throw new AppError({ code: "EXTERNAL_IDENTITY_DATA_CONFLICT", message: "Multiple CIS issues use the verified Jira trace key.", status: 409 });
        if (owners.some((owner) => owner.id !== issue.id)) throw new AppError({ code: "EXTERNAL_LINK_DUPLICATE", message: "Verified Jira trace target belongs to another CIS issue.", status: 409 });
        if (preparedIssue.jira_issue_key && String(preparedIssue.jira_issue_key).trim().toUpperCase() !== key) {
          throw new AppError({ code: "JIRA_TRACE_STATE_CHANGED", message: "Jira identity changed before job preparation.", status: 409 });
        }
        if (!preparedIssue.jira_issue_key) {
          preparedIssue = repository.linkExternalIdentityRows(issue.id, { jira_issue_key: key });
          SyncApi.writeJournalInTransaction({
            db,
            input: {
              project_id: issue.project_id,
              issue_id: issue.id,
              direction_from: "cis",
              direction_to: "jira",
              job_type: "push_issue",
              action: "jira_trace_linked",
              status: "success",
              trigger: "manual",
              message: "Verified Jira trace identity linked before enqueue.",
              details_json: { jira_issue_key: key },
              executed_by: executedBy || null,
              correlation_id: correlationId || null,
            },
          });
        }
      }
      const h2 = buildCanonicalSyncSnapshot({ issue: preparedIssue, revision }).canonical_hash;
      const prepared = SyncApi.enqueueIssueJobIfNoneActiveInTransaction({
        db,
        input: {
          project_id: issue.project_id,
          issue_id: issue.id,
          direction_from: "cis",
          direction_to: "jira",
          job_type: "push_issue",
          payload_json: {
            requested_by: executedBy || null,
            dry_run_canonical_hash: expectedHash,
            post_draft_canonical_hash: h1,
            canonical_hash: h2,
            target_action: targetAction,
            verified_trace_key: verifiedTraceKey || null,
            jira_payload_override: jiraPayloadOverride || null,
            parent_sync_job_id: parentSyncJobId,
          },
          priority: 40,
          trigger: "manual",
          executed_by: executedBy || null,
          correlation_id: correlationId || null,
        },
      });
      if (Object.keys(jiraFields || {}).length > 0) {
        SyncApi.writeJournalInTransaction({
          db,
          input: {
            project_id: issue.project_id,
            issue_id: issue.id,
            direction_from: "cis",
            direction_to: "jira",
            job_type: "push_issue",
            action: "jira_draft_saved",
            status: "success",
            trigger: "manual",
            message: "Jira draft fields saved before sync.",
            details_json: { fields: Object.keys(jiraFields), canonical_hash: h1 },
            executed_by: executedBy || null,
            correlation_id: correlationId || null,
          },
        });
      }
      SyncApi.writeJournalInTransaction({
        db,
        input: {
          sync_job_id: prepared.job.id,
          project_id: issue.project_id,
          issue_id: issue.id,
          direction_from: "cis",
          direction_to: "jira",
          job_type: "push_issue",
          action: "jira_sync_requested",
          status: "pending",
          trigger: "manual",
          message: "Jira sync job requested.",
          executed_by: executedBy || null,
          correlation_id: correlationId || null,
        },
      });
      return { job: prepared.job, reused: prepared.reused, canonical_hash: h2 };
    });
    getLogger(config).info({
      event: result.reused ? "job.reused" : "job.enqueued",
      job_id: result.job.id,
      job_type: result.job.job_type,
      ...(result.reused
        ? { job_trace_id: result.job.trace_id, job_correlation_id: result.job.correlation_id }
        : { trace_id: result.job.trace_id, correlation_id: result.job.correlation_id }),
    });
    return result;
  } finally {
    db.close();
  }
}

module.exports = { prepareJiraSyncJob };
