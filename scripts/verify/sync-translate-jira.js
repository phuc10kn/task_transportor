const assert = require("assert");
const path = require("path");

const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const { createConnection } = require("../../src/infrastructure/database/connection");
const BacklogApi = require("../../src/modules/Backlog/BacklogApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const MappingApi = require("../../src/modules/Mapping/MappingApi");
const JiraApi = require("../../src/modules/Jira/JiraApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const TranslationApi = require("../../src/modules/Translation/TranslationApi");
const { makeTempConfig } = require("./helpers/tempConfig");
const { installFakeAiFetch } = require("./helpers/fake-ai-fetch");

function approveMapping(config, projectId, type, from, cis, jira) {
  const inbound = MappingApi.createMappingRule({
    config,
    input: { project_id: projectId, mapping_type: type, direction_from: "backlog", direction_to: "cis", from_value: from, to_value: cis },
  });
  MappingApi.approveMappingRule({ config, ruleId: inbound.id });
  const outbound = MappingApi.createMappingRule({
    config,
    input: { project_id: projectId, mapping_type: type, direction_from: "cis", direction_to: "jira", from_value: cis, to_value: jira },
  });
  MappingApi.approveMappingRule({ config, ruleId: outbound.id });
}

function assertRolledBack(config, projectId, key, summary, description) {
  const issue = CisApi.getIssueByBacklogKey({ config, projectId, backlogIssueKey: key });
  const editor = CisApi.getIssueEditor({ config, issueId: issue.id });
  assert.equal(editor.canonical.summary.value, summary);
  assert.equal(editor.canonical.description.value, description);
  assert.ok(editor.translations.every((item) => item.review_status === "pending" && item.ai_draft === null));
  assert.equal(issue.jira_issue_key, null);
}

async function queueAndRun(config, projectId, key) {
  const queued = await BacklogApi.syncCandidateToCis({
    config,
    projectId,
    backlogIssueKey: key,
    withTranslation: true,
    pushToJira: true,
  });
  assert.equal(queued.job.job_type, "sync_translate_jira");
  assert.equal(queued.job.direction_to, "jira");
  return SyncApi.runJobNow({ config, jobId: queued.job.id, workerId: `verify-${key}` });
}

async function main() {
  const config = makeTempConfig("sync-translate-jira", {
    BACKLOG_FAKE_FIXTURE_PATH: path.join(__dirname, "fixtures", "backlog-issue-filter.json"),
    JIRA_FAKE_MODE: "1",
    JIRA_FAKE_SEED_PATH: path.join(__dirname, "fixtures", "jira-system-issues.json"),
    WORKER_ENABLED: "true",
    DEEPSEEK_API_KEY: "sync-translate-jira-test-key",
  });
  ensureStorage(config.storage);
  migrate({ config });
  installFakeAiFetch();
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Project 1 only",
      enabled: true,
      sync_enabled: true,
      jira_external_read_enabled: true,
      jira_external_write_enabled: true,
      manual_pull_enabled: true,
      backlog_space_url: "https://example.backlog.com",
      backlog_project_key: "WEC",
      backlog_issue_key_prefix: "WEC",
      backlog_api_key_env: "BACKLOG_API_KEY_WEC",
      jira_site_url: "https://example.atlassian.net",
      jira_project_key: "WEC",
      jira_email: "verify@example.test",
      jira_api_token: "verify-token",
      translation_ai_provider: "deepseek",
      source_language: "ja",
      target_language: "vi",
    },
  });
  assert.equal(project.id, 1);
  approveMapping(config, 1, "issue_type", "Task", "task", "Task");
  approveMapping(config, 1, "status", "Open", "open", "To Do");
  approveMapping(config, 1, "priority", "Normal", "normal", "Medium");

  const success = await queueAndRun(config, 1, "WEC-4");
  assert.equal(success.job.status, "success", success.error && success.error.message);
  const successfulIssue = CisApi.getIssueByBacklogKey({ config, projectId: 1, backlogIssueKey: "WEC-4" });
  const successfulEditor = CisApi.getIssueEditor({ config, issueId: successfulIssue.id });
  assert.ok(successfulIssue.jira_issue_key);
  assert.match(successfulEditor.canonical.summary.value, /^【WEC-4】\[vi\]/);
  assert.ok(successfulEditor.translations.every((item) => item.review_status === "approved"));

  const originalTranslateNow = TranslationApi.translateQueueItemNow;
  TranslationApi.translateQueueItemNow = async (input) => {
    const item = TranslationApi.getTranslationQueueItem({ config, queueId: input.queueId, projectId: 1 });
    if (item.target_field === "description") {
      const error = new Error("Forced translation element failure.");
      error.code = "VERIFY_TRANSLATION_ELEMENT_FAILED";
      error.retryable = false;
      throw error;
    }
    return originalTranslateNow(input);
  };
  let failed;
  try {
    failed = await queueAndRun(config, 1, "WEC-5");
  } finally {
    TranslationApi.translateQueueItemNow = originalTranslateNow;
  }
  assert.equal(failed.job.status, "failed");
  assert.equal(failed.error.code, "VERIFY_TRANSLATION_ELEMENT_FAILED");
  assertRolledBack(
    config,
    1,
    "WEC-5",
    "Atomic rollback candidate",
    "The second translation element must fail without partial canonical apply."
  );

  const originalJiraDelivery = JiraApi.handlePushIssueJob;
  JiraApi.handlePushIssueJob = async () => {
    const error = new Error("Forced Jira delivery failure.");
    error.code = "VERIFY_JIRA_DELIVERY_FAILED";
    error.retryable = false;
    throw error;
  };
  let jiraFailed;
  try {
    jiraFailed = await queueAndRun(config, 1, "WEC-2");
  } finally {
    JiraApi.handlePushIssueJob = originalJiraDelivery;
  }
  assert.equal(jiraFailed.job.status, "failed");
  assert.equal(jiraFailed.error.code, "VERIFY_JIRA_DELIVERY_FAILED");
  assertRolledBack(
    config,
    1,
    "WEC-2",
    "【WEC-2】Export button is disabled",
    "The export button remains disabled for admins."
  );

  const blocked = await queueAndRun(config, 1, "WEC-1");
  assert.equal(blocked.job.status, "failed");
  assert.equal(blocked.error.code, "JIRA_DRY_RUN_BLOCKED");
  assertRolledBack(
    config,
    1,
    "WEC-1",
    "Login screen fails",
    "The login screen shows an error after submit."
  );

  const db = createConnection({ config });
  try {
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM projects WHERE id <> 1").get().total, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS total FROM sync_jobs WHERE job_type IN ('translate', 'push_issue', 'push_comment')").get().total, 0);
  } finally {
    db.close();
  }
  console.log("Sync + Translate + Jira dedicated-job verification passed for project_id=1.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
