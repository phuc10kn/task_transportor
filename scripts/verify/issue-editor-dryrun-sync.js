const assert = require("assert");

const { createApp } = require("../../src/app");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const MappingApi = require("../../src/modules/Mapping/MappingApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const { ISSUE_STATUSES } = require("../../src/shared/stateConstants");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function setupConfig() {
  const config = makeTempConfig("issue-editor-dryrun-sync", {
    ADMIN_EMAIL: "issue-editor-dryrun@example.test",
    ADMIN_PASSWORD: "verify-password",
  });

  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({
    config,
    email: "issue-editor-dryrun@example.test",
    password: "verify-password",
  });

  return config;
}

function createProject(config) {
  return ProjectsApi.createProject({
    config,
    input: {
      name: "Issue Editor Dry-run Verify",
      enabled: true,
      sync_enabled: true,
      backlog_project_key: "IEDR",
      backlog_issue_key_prefix: "IEDR",
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_site_url: "https://jira.example.test",
      jira_project_key: "IED",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_TOKEN",
      require_translation_review: true,
    },
  });
}

function createIssue(config, project) {
  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: "IEDR-1",
      source_system: "backlog",
      status: ISSUE_STATUSES.APPROVED,
      fields_json: {
        summary: { backlog: "Backlog summary" },
        description: { backlog: "Backlog description" },
        issue_type: { backlog: "Bug" },
        status: { backlog: "Open" },
        priority: { backlog: "High" },
        assignee: { backlog: "tanaka@example.test" },
      },
    },
  });

  CisApi.addRevision({
    config,
    input: {
      issue_id: issue.id,
      source_system: "backlog",
      summary: "Backlog summary",
      description: "Backlog description",
      issue_type: "Bug",
      priority: "High",
      assignee: "tanaka@example.test",
    },
  });

  CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "issue",
      target_field: "summary",
      source_text: "Backlog summary",
    },
  });

  return issue;
}

function approveMapping(config, projectId, mappingType, fromValue, toValue) {
  const rule = MappingApi.createMappingRule({
    config,
    input: {
      project_id: projectId,
      mapping_type: mappingType,
      direction_from: "cis",
      direction_to: "jira",
      from_value: fromValue,
      to_value: toValue,
    },
  });

  MappingApi.approveMappingRule({
    config,
    ruleId: rule.id,
    approvedBy: 1,
  });
}

function seedMappings(config, project) {
  approveMapping(config, project.id, "issue_type", "Task", "Task");
  approveMapping(config, project.id, "status", "Done", "Done");
  approveMapping(config, project.id, "priority", "Medium", "Medium");
}

async function login(server) {
  const response = await requestJson(server, {
    method: "POST",
    pathname: "/api/v1/auth/login",
    body: {
      email: "issue-editor-dryrun@example.test",
      password: "verify-password",
    },
  });

  assert.equal(response.status, 200);
  return response.body.data.token;
}

async function main() {
  const config = setupConfig();
  const project = createProject(config);
  const issue = createIssue(config, project);
  seedMappings(config, project);
  const app = createApp({ config });

  await withServer(app, async (server) => {
    const token = await login(server);

    const patched = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/issues/${issue.id}`,
      token,
      body: {
        summary: "Canonical summary",
        description: "Canonical plain description",
        issue_type: "Task",
        status: "Done",
        priority: "Medium",
        assignee: "tanaka@example.test",
        assignee_meta: {
          jira_account_id: "account-123",
        },
        due_date: "2026-07-31",
        reason: "Verify dry-run canonical payload",
      },
    });
    assert.equal(patched.status, 200);

    const dryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(dryRun.status, 200);
    assert.equal(dryRun.body.data.can_sync, true);
    assert.equal(dryRun.body.data.payload.fields.summary, "Canonical summary");
    assert.equal(dryRun.body.data.payload.fields.description, "Canonical plain description");
    assert.equal(dryRun.body.data.payload.fields.issuetype.name, "Task");
    assert.equal(dryRun.body.data.payload.fields.priority.name, "Medium");
    assert.equal(dryRun.body.data.payload.fields.assignee.accountId, "account-123");
    assert.equal(dryRun.body.data.payload.fields.duedate, "2026-07-31");
    assert.ok(!Object.prototype.hasOwnProperty.call(dryRun.body.data.payload.fields, "labels"));
    assert.equal(dryRun.body.data.payload.transition_preview.status, "Done");
    assert.equal(dryRun.body.data.field_sources.summary, "cis");
    assert.equal(dryRun.body.data.field_sources.due_date, "cis");
    assert.ok(dryRun.body.data.canonical_hash.startsWith("sha256:"));
    assert.deepEqual(dryRun.body.data.excluded_collections, ["worklogs"]);
    assert.ok(
      !dryRun.body.data.validation.errors.some((error) => error.code === "TRANSLATION_REVIEW_REQUIRED")
    );

    const editedAfterDryRun = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/issues/${issue.id}`,
      token,
      body: {
        summary: "Canonical summary changed",
        reason: "Make dry-run stale",
      },
    });
    assert.equal(editedAfterDryRun.status, 200);

    const staleSync = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${issue.id}/sync/jira`,
      token,
    });
    assert.equal(staleSync.status, 422);
    assert.equal(staleSync.body.error.code, "DRY_RUN_STALE");

    const freshDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(freshDryRun.status, 200);
    assert.equal(freshDryRun.body.data.can_sync, true);
    assert.equal(freshDryRun.body.data.payload.fields.summary, "Canonical summary changed");

    const acceptedSync = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${issue.id}/sync/jira`,
      token,
      body: {
        jira_fields: {
          summary: "Edited Jira summary",
          description: "Edited Jira description",
          issue_type: "Task",
          priority: "Medium",
          status: "Done",
          assignee: "account-123",
          due_date: "2026-08-15",
        },
      },
    });
    assert.equal(acceptedSync.status, 202);
    assert.equal(acceptedSync.body.data.job_type, "push_issue");
    assert.equal(acceptedSync.body.data.payload_json.jira_payload_override.fields.summary, "Edited Jira summary");
    assert.equal(acceptedSync.body.data.payload_json.jira_payload_override.fields.description, "Edited Jira description");
    assert.equal(acceptedSync.body.data.payload_json.jira_payload_override.fields.duedate, "2026-08-15");
    assert.equal(acceptedSync.body.data.payload_json.jira_payload_override.transition_preview.status, "Done");
    const issueAfterSyncRequest = CisApi.getIssueById({ config, issueId: issue.id });
    assert.equal(issueAfterSyncRequest.fields_json.summary.jira, "Edited Jira summary");
    assert.equal(issueAfterSyncRequest.fields_json.description.jira, "Edited Jira description");
    assert.equal(issueAfterSyncRequest.fields_json.due_date.jira, "2026-08-15");
  });

  console.log("Issue Editor dry-run/sync verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
