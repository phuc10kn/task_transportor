const AnomalyApi = require("../../Anomaly/AnomalyApi");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createJiraClient } = require("../infrastructure/JiraClient");
const { createJiraSyncRepository } = require("../infrastructure/JiraSyncRepository");
const { evaluateJiraSyncReadiness } = require("./runJiraDryRun");
const { jiraStoryPointFieldId } = require("../support/jiraDryRunPayload");

function syncBlockedError(result) {
  const first = result.validation.errors[0] || {
    code: "JIRA_SYNC_BLOCKED",
    message: "Issue cannot sync to Jira.",
    details: {},
  };

  const error = new Error(first.message);
  error.code = first.code;
  error.status = 422;
  error.details = {
    ...first.details,
    validation: result.validation,
  };
  error.retryable = false;
  return error;
}

function conflictError(matches) {
  const error = new Error("Multiple Jira issues matched the CIS trace.");
  error.code = "JIRA_TRACE_CONFLICT";
  error.status = 409;
  error.details = {
    jira_matches: matches.map((match) => match.key),
  };
  error.retryable = false;
  return error;
}

function traceChangedError(matches) {
  const error = new Error("Jira trace state changed before create.");
  error.code = "JIRA_TRACE_STATE_CHANGED";
  error.status = 409;
  error.details = { jira_matches: matches.map((match) => match.key) };
  error.retryable = false;
  return error;
}

async function resolveTargetIssueKey(client, bundle) {
  if (bundle.issue.jira_issue_key) {
    try {
      const issue = await client.getIssue(bundle.issue.jira_issue_key);
      return {
        action: "update",
        jira_issue_key: issue.key,
      };
    } catch (error) {
      if (error.code === "JIRA_RESOURCE_NOT_FOUND" || error.code === "JIRA_ISSUE_NOT_FOUND") {
        error.code = "JIRA_LINKED_ISSUE_NOT_FOUND";
        error.retryable = false;
      }
      throw error;
    }
  }

  const matches = await client.searchIssuesByTrace({
    backlogIssueKey: bundle.issue.backlog_issue_key,
    issueId: bundle.issue.id,
  });

  if (matches.length === 1) {
    return {
      action: "link_update",
      jira_issue_key: matches[0].key,
      matches,
    };
  }

  if (matches.length > 1) {
    throw conflictError(matches);
  }

  return {
    action: "create",
    jira_issue_key: null,
  };
}

async function payloadWithResolvedUsers(client, payload) {
  const resolved = {
    ...payload,
    fields: {
      ...payload.fields,
    },
  };

  for (const field of ["assignee", "reporter"]) {
    const user = resolved.fields[field];
    if (user && user.emailAddress) {
      resolved.fields[field] = {
        accountId: await client.resolveUserAccountId(user.emailAddress),
      };
    }
  }

  return resolved;
}

async function handlePushIssueJob(job, { config }) {
  const repository = createJiraSyncRepository({ config });
  const readiness = evaluateJiraSyncReadiness({ config, issueId: job.issue_id });
  if (!readiness.can_sync) {
    const error = syncBlockedError(readiness);
    SyncApi.writeJournal({
      config,
      input: {
        sync_job_id: job.id,
        project_id: readiness.project.id,
        issue_id: readiness.issue.id,
        direction_from: "cis",
        direction_to: "jira",
        job_type: "push_issue",
        action: "jira_sync_blocked",
        status: "failed",
        trigger: "system",
        message: error.message,
        details_json: {
          error_codes: readiness.validation.errors.map((item) => item.code),
        },
        error_message: error.message,
        attempt_count: job.attempt_count,
      },
    });
    throw error;
  }

  if (job.payload_json && job.payload_json.canonical_hash && job.payload_json.canonical_hash !== readiness.canonical_hash) {
    const error = new Error("Canonical issue changed after Jira sync was requested.");
    error.code = "JIRA_SYNC_STALE";
    error.status = 409;
    error.retryable = false;
    throw error;
  }

  const previousStatus = readiness.issue.status;
  CisApi.markIssueSyncStatus({
    config,
    issueId: readiness.issue.id,
    status: "syncing",
  });

  try {
    const payload = job.payload_json && job.payload_json.jira_payload_override
      ? job.payload_json.jira_payload_override
      : readiness.payload;
    const client = createJiraClient({
      config,
      project: readiness.project,
    });
    const resolution = await resolveTargetIssueKey(client, readiness);
    if (job.payload_json && job.payload_json.target_action) {
      const actualAction = resolution.action === "create" ? "create" : "update";
      if (actualAction !== job.payload_json.target_action) {
        throw traceChangedError(resolution.matches || (resolution.jira_issue_key ? [{ key: resolution.jira_issue_key }] : []));
      }
    }
    const jiraPayload = await payloadWithResolvedUsers(client, payload);
    let jiraIssueKey = resolution.jira_issue_key;
    if (resolution.action === "create") {
      const latestMatches = await client.searchIssuesByTrace({
        backlogIssueKey: readiness.issue.backlog_issue_key,
        issueId: readiness.issue.id,
      });
      if (latestMatches.length > 1) throw conflictError(latestMatches);
      if (latestMatches.length === 1) throw traceChangedError(latestMatches);
      const created = await client.createIssue(jiraPayload);
      jiraIssueKey = created.key;
    } else {
      if (resolution.action === "link_update") {
        CisApi.claimJiraIdentityForSync({ config, issueId: readiness.issue.id, jiraIssueKey, syncJobId: job.id });
      }
      await client.updateIssue(jiraIssueKey, jiraPayload);
    }

    if (payload.transition_preview && payload.transition_preview.status) {
      await client.transitionIssue(jiraIssueKey, payload.transition_preview.status);
    }

    const saved = CisApi.saveJiraSyncResult({
      config,
      issueId: readiness.issue.id,
      input: {
      expected_jira_issue_key: resolution.action === "create" ? null : resolution.jira_issue_key,
      jira_issue_key: jiraIssueKey,
      issue_status: "synced",
      summary: payload.fields.summary,
      description: payload.fields.description,
      issue_type: payload.fields.issuetype && payload.fields.issuetype.name,
      priority: payload.fields.priority && payload.fields.priority.name,
      status: payload.transition_preview && payload.transition_preview.status,
      assignee: payload.fields.assignee
        && (payload.fields.assignee.emailAddress || payload.fields.assignee.accountId || payload.fields.assignee.name),
      due_date: payload.fields.duedate,
      story_point: payload.fields[jiraStoryPointFieldId(
        readiness.project,
        payload.fields.issuetype && payload.fields.issuetype.name
      )],
      reporter: payload.fields.reporter
        && (payload.fields.reporter.emailAddress || payload.fields.reporter.accountId || payload.fields.reporter.name),
      },
    });

    const syncableComments = job.payload_json?.suppress_comment_jobs === true
      ? []
      : repository.listSyncableComments(readiness.issue.id);
    const commentJobs = syncableComments.map((comment) =>
      SyncApi.enqueueJob({
        config,
        input: {
          project_id: readiness.project.id,
          issue_id: readiness.issue.id,
          comment_id: comment.id,
          direction_from: "cis",
          direction_to: "jira",
          job_type: "push_comment",
          payload_json: {
            jira_issue_key: jiraIssueKey,
          },
          priority: 70,
          trigger: "auto",
        },
      }).id
    );

    SyncApi.writeJournal({
      config,
      input: {
        sync_job_id: job.id,
        project_id: readiness.project.id,
        issue_id: readiness.issue.id,
        direction_from: "cis",
        direction_to: "jira",
        job_type: "push_issue",
        action: resolution.action === "create" ? "create" : "update",
        status: "success",
        trigger: "system",
        message: resolution.action === "create"
          ? "Jira issue created from CIS."
          : "Jira issue updated from CIS.",
        details_json: {
          jira_issue_key: jiraIssueKey,
          source_action: resolution.action,
          payload_override: Boolean(job.payload_json && job.payload_json.jira_payload_override),
          comment_jobs: commentJobs,
        },
        attempt_count: job.attempt_count,
      },
    });

    return {
      issue_id: saved.id,
      jira_issue_key: jiraIssueKey,
      action: resolution.action === "create" ? "create" : "update",
      comment_jobs: commentJobs.length,
    };
  } catch (error) {
    CisApi.markIssueSyncStatus({
      config,
      issueId: readiness.issue.id,
      status: previousStatus,
    });

    if (error.code === "JIRA_TRACE_CONFLICT") {
      CisApi.markIssueConflict({
        config,
        issueId: readiness.issue.id,
      });
      AnomalyApi.createAnomaly({
        config,
        input: {
          project_id: readiness.project.id,
          issue_id: readiness.issue.id,
          anomaly_type: "unusual_field_change",
          severity: "critical",
          details_json: {
            reason: "jira_trace_conflict",
            jira_matches: error.details && error.details.jira_matches || [],
          },
          ai_analysis: "Multiple Jira issues matched the trace search, so sync was blocked.",
        },
      });
      SyncApi.writeJournal({
        config,
        input: {
          sync_job_id: job.id,
          project_id: readiness.project.id,
          issue_id: readiness.issue.id,
          direction_from: "cis",
          direction_to: "jira",
          job_type: "push_issue",
          action: "jira_trace_conflict",
          status: "failed",
          trigger: "system",
          message: error.message,
          details_json: error.details || {},
          error_message: error.message,
          attempt_count: job.attempt_count,
        },
      });
    }

    throw error;
  }
}

module.exports = {
  handlePushIssueJob,
};
