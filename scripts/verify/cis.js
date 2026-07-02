const assert = require("assert");

const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const { makeTempConfig } = require("./helpers/tempConfig");

function assertTablesExist(config) {
  const required = [
    "issues",
    "issue_revisions",
    "issue_comments",
    "issue_attachments",
    "translation_queue",
    "mapping_rules",
    "anomaly_log",
    "sync_jobs",
    "sync_journal",
    "pull_state",
  ];

  const db = createConnection({ config });
  const rows = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map((row) => row.name);
  db.close();

  for (const table of required) {
    assert.ok(rows.includes(table), `Missing table: ${table}`);
  }
}

function createProject(config) {
  return ProjectsApi.createProject({
    config,
    input: {
      name: "CIS Verify Project",
      sync_enabled: true,
      backlog_project_key: "WEC",
      backlog_issue_key_prefix: "WEC",
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_project_key: "SYNC",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_API_TOKEN",
      translation_provider: "codex_exec",
    },
  });
}

async function main() {
  const config = makeTempConfig("cis");

  ensureStorage(config.storage);
  migrate({ config });
  assertTablesExist(config);

  const project = createProject(config);
  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: "WEC-1",
      source_system: "backlog",
      fields_json: {
        summary: { backlog: "Login fails" },
      },
    },
  });
  assert.ok(issue.id);
  assert.equal(issue.project_id, project.id);

  const firstRevision = CisApi.addRevision({
    config,
    input: {
      issue_id: issue.id,
      source_system: "backlog",
      summary: "Login fails",
      description: "Initial description",
    },
  });
  const secondRevision = CisApi.addRevision({
    config,
    input: {
      issue_id: issue.id,
      source_system: "backlog",
      summary: "Login fails",
      description: "Updated description",
    },
  });
  assert.equal(firstRevision.revision, 1);
  assert.equal(secondRevision.revision, 2);
  assert.equal(firstRevision.fields_json.summary.backlog, "Login fails");
  assert.equal(firstRevision.fields_json.description.backlog, "Initial description");
  assert.equal(firstRevision.fields_json.summary.cis, "Login fails");
  assert.equal(firstRevision.fields_json.description.cis, "Initial description");

  const translation = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "issue",
      target_field: "summary",
      source_text: "Login fails",
      provider: "codex_exec",
      model_or_command: "codex exec",
    },
  });
  assert.equal(translation.provider, "codex_exec");
  assert.equal(translation.model_or_command, "codex exec");

  const db = createConnection({ config });
  const mappingColumns = db.prepare("PRAGMA table_info(mapping_rules)").all().map((column) => column.name);
  const jobColumns = db.prepare("PRAGMA table_info(sync_jobs)").all().map((column) => column.name);
  const journalColumns = db.prepare("PRAGMA table_info(sync_journal)").all().map((column) => column.name);
  db.close();
  assert.ok(mappingColumns.includes("direction_from"));
  assert.ok(mappingColumns.includes("direction_to"));
  assert.ok(jobColumns.includes("direction_from"));
  assert.ok(jobColumns.includes("direction_to"));
  assert.ok(journalColumns.includes("direction_from"));
  assert.ok(journalColumns.includes("direction_to"));

  console.log("CIS verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
