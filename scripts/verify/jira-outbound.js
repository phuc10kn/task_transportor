const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const JiraApi = require("../../src/modules/Jira/JiraApi");
const MappingApi = require("../../src/modules/Mapping/MappingApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const TranslationApi = require("../../src/modules/Translation/TranslationApi");
const { createJiraClient } = require("../../src/modules/Jira/infrastructure/JiraClient");
const { markdownToAdf } = require("../../src/modules/Jira/support/jiraAdf");
const { makeTempConfig } = require("./helpers/tempConfig");
const { requestJson, withServer } = require("./helpers/http");

function setupConfig(name, overrides = {}) {
  const config = makeTempConfig(name, {
    ADMIN_EMAIL: `${name}@example.test`,
    ADMIN_PASSWORD: "verify-password",
    JIRA_FAKE_MODE: "1",
    JIRA_FAKE_STATE_PATH: path.join(process.cwd(), "storage", `${name}-jira-fake-state.json`),
    ...overrides,
  });
  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({
    config,
    email: `${name}@example.test`,
    password: "verify-password",
  });
  return config;
}

function writeFakeState(config, input = {}) {
  const statePath = config.jira.fakeStatePath;
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(
    statePath,
    JSON.stringify({
      issueCounter: 1,
      commentCounter: 1,
      issues: [],
      failures: {},
      ...input,
    }, null, 2)
  );
}

function readFakeState(config) {
  return JSON.parse(fs.readFileSync(config.jira.fakeStatePath, "utf8"));
}

function verifyMarkdownToAdf() {
  const adf = markdownToAdf([
    "# Main title",
    "",
    "Backlog: [PH6-1](https://backlog.example.test/view/PH6-1)",
    "",
    "## Reviewed content",
    "",
    "- **Bold** item",
    "- plain `code` item",
    "",
    "1. First",
    "2. *Second*",
    "",
    "> quoted source",
    "",
    "---",
  ].join("\n"));

  assert.equal(adf.version, 1);
  assert.equal(adf.type, "doc");
  assert.equal(adf.content[0].type, "heading");
  assert.equal(adf.content[0].attrs.level, 1);
  assert.equal(adf.content[2].content[1].marks[0].type, "link");
  assert.equal(adf.content[4].type, "heading");
  assert.equal(adf.content[6].type, "bulletList");
  assert.equal(adf.content[6].content[0].content[0].content[0].marks[0].type, "strong");
  assert.equal(adf.content[6].content[1].content[0].content[1].marks[0].type, "code");
  assert.equal(adf.content[8].type, "orderedList");
  assert.equal(adf.content[8].content[1].content[0].content[0].marks[0].type, "em");
  assert.equal(adf.content[10].type, "blockquote");
  assert.equal(adf.content[12].type, "rule");
}

function withMockJiraServer(callback) {
  const server = http.createServer((req, res) => {
    const send = (body) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    const pathname = new URL(req.url, "http://127.0.0.1").pathname;

    if (pathname === "/rest/api/3/project/DMP/statuses") {
      send([{ id: "10001", name: "Task", statuses: [{ id: "3", name: "To Do" }] }]);
      return;
    }
    if (pathname === "/rest/api/3/priority") {
      send([{ id: "10002", name: "Medium" }]);
      return;
    }
    if (pathname === "/rest/api/3/project/DMP/components") {
      send([{ id: "10003", name: "Frontend" }]);
      return;
    }
    if (pathname === "/rest/api/3/user/assignable/search") {
      send([
        { emailAddress: "email-user@example.test", accountId: "email-account-id", displayName: "Email User", accountType: "atlassian" },
        { accountId: "old-user-account-id", displayName: "Old User", active: false, accountType: "atlassian" },
        { accountId: "slack-account-id", displayName: "Slack", accountType: "app" },
      ]);
      return;
    }
    if (pathname === "/rest/api/3/user/assignable/multiProjectSearch") {
      send([
        { accountId: "multi-project-account-id", displayName: "Hidden Multi User", accountType: "atlassian" },
        { accountId: "teams-account-id", displayName: "Microsoft Teams for Jira Cloud", accountType: "app" },
      ]);
      return;
    }
    if (pathname === "/rest/api/3/project/DMP/role") {
      send({
        Developers: `http://${req.headers.host}/rest/api/3/project/DMP/role/10002`,
      });
      return;
    }
    if (pathname === "/rest/api/3/project/DMP/role/10002") {
      send({
        actors: [
          { actorUser: { accountId: "role-account-id", displayName: "Role User", accountType: "atlassian" } },
          { actorUser: { accountId: "triage-account-id", displayName: "Jira Triage Agent", accountType: "app" } },
          { actorUser: { accountId: "atlas-account-id", displayName: "Atlas for Jira Cloud", accountType: "app" } },
        ],
      });
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ errorMessages: [`Unhandled path ${pathname}`] }));
  });

  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", async () => {
      try {
        await callback(server);
        server.close((error) => error ? reject(error) : resolve());
      } catch (error) {
        server.close(() => reject(error));
      }
    });
  });
}

async function verifyJiraMappingUserPullKeepsHiddenUsers() {
  await withMockJiraServer(async (server) => {
    const { port } = server.address();
    const client = createJiraClient({
      config: {
        jira: {
          fakeMode: "",
          requestTimeoutSeconds: 5,
        },
      },
      project: {
        jira_site_url: `http://127.0.0.1:${port}`,
        jira_project_key: "DMP",
        jira_email: "admin@example.test",
        jira_api_token: "token",
      },
    });
    const values = await client.pullMappingValues();

    assert.ok(values.user.includes("email-user@example.test"));
    assert.ok(values.user.includes("multi-project-account-id"));
    assert.ok(values.user.includes("role-account-id"));
    assert.ok(!values.user.includes("old-user-account-id"));
    assert.ok(!values.user.includes("slack-account-id"));
    assert.ok(!values.user.includes("teams-account-id"));
    assert.ok(!values.user.includes("triage-account-id"));
    assert.ok(!values.user.includes("atlas-account-id"));
    assert.equal(values.user_labels["email-user@example.test"], "Email User");
    assert.equal(values.user_labels["multi-project-account-id"], "Hidden Multi User");
    assert.equal(values.user_labels["role-account-id"], "Role User");
    assert.deepEqual(values.cis_user_emails, ["email-user@example.test"]);
    assert.deepEqual(values.issue_type_directory, [{ id: "10001", value: "Task", name: "Task" }]);
    assert.deepEqual(values.status_directory, [{ id: "3", value: "To Do", name: "To Do" }]);
    assert.deepEqual(values.priority_directory, [{ id: "10002", value: "Medium", name: "Medium" }]);
    assert.deepEqual(values.component_directory, [{ id: "10003", value: "Frontend", name: "Frontend" }]);
    assert.deepEqual(values.user_directory.find((user) => user.id === "email-account-id"), {
      id: "email-account-id",
      value: "email-user@example.test",
      name: "Email User",
      email: "email-user@example.test",
    });
    assert.ok(values.user_directory.some((user) => user.id === "multi-project-account-id"));
    assert.ok(values.user_directory.some((user) => user.id === "role-account-id"));
    assert.ok(!values.user_directory.some((user) => user.id === "slack-account-id"));
  });
}

function createProject(config, suffix) {
  return ProjectsApi.createProject({
    config,
    input: {
      name: `Jira Outbound ${suffix}`,
      sync_enabled: true,
      backlog_space_url: "https://backlog.example.test",
      backlog_project_key: suffix,
      backlog_issue_key_prefix: suffix,
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_site_url: "https://jira.example.test",
      jira_project_key: "DMP",
      jira_email_env: "JIRA_EMAIL_TEST",
      jira_api_token_env: "JIRA_API_TOKEN_TEST",
      source_language: "ja",
      target_language: "vi",
      auto_translate: true,
      require_translation_review: true,
      require_mapping_approval: true,
    },
  });
}

function insertComment(config, project, issue, content, backlogCommentId = null) {
  const db = createConnection({ config });
  const id = crypto.randomUUID();
  db
    .prepare(
      `INSERT INTO issue_comments (
        id,
        project_id,
        issue_id,
        backlog_comment_id,
        source_system,
        content_original,
        author_name,
        created_at_source
      )
      VALUES (?, ?, ?, ?, 'backlog', ?, ?, datetime('now'))`
    )
    .run(
      id,
      project.id,
      issue.id,
      backlogCommentId || `comment-${Math.floor(Math.random() * 100000)}`,
      content,
      "Verifier"
    );
  const row = db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(id);
  db.close();
  return row;
}

function createReadyIssue(config, project, options = {}) {
  const backlogIssueKey = options.backlog_issue_key || `${project.backlog_project_key}-${Math.floor(Math.random() * 100000)}`;
  const summary = options.summary || "ログイン画面でエラーが出ます";
  const description = options.description || "保存後に500エラーが表示されます。";
  const issueType = options.issue_type || "Task";
  const status = options.status || "Resolved";
  const priority = options.priority || "Normal";
  const assignee = options.assignee || null;
  const dueDate = options.due_date || null;
  const assigneeMeta = options.assignee_account_id
    ? { cis: { jira_account_id: options.assignee_account_id } }
    : undefined;

  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: backlogIssueKey,
      source_system: "backlog",
      status: "pending_translate",
      fields_json: {
        summary: { backlog: summary },
        description: { backlog: description },
        issue_type: { backlog: issueType },
        status: { backlog: status },
        priority: { backlog: priority },
        assignee: { backlog: assignee },
        due_date: { cis: dueDate },
        ...(assigneeMeta ? { assignee_meta: assigneeMeta } : {}),
      },
    },
  });

  CisApi.addRevision({
    config,
    input: {
      issue_id: issue.id,
      source_system: "backlog",
      summary,
      description,
      issue_type: issueType,
      priority,
      assignee,
    },
  });

  const summaryTranslation = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "issue",
      target_field: "summary",
      source_text: summary,
    },
  });
  const descriptionTranslation = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "issue",
      target_field: "description",
      source_text: description,
    },
  });

  TranslationApi.saveTranslationDraft({
    config,
    queueId: summaryTranslation.id,
    draftText: `VI: ${summary}`,
    editedBy: 1,
    reviewNotes: "verify",
  });
  TranslationApi.approveTranslation({ config, queueId: summaryTranslation.id, reviewedBy: 1, reviewNotes: "verify" });
  TranslationApi.saveTranslationDraft({
    config,
    queueId: descriptionTranslation.id,
    draftText: `VI: ${description}`,
    editedBy: 1,
    reviewNotes: "verify",
  });
  TranslationApi.approveTranslation({ config, queueId: descriptionTranslation.id, reviewedBy: 1, reviewNotes: "verify" });

  let comment = null;
  if (options.include_comment !== false) {
    comment = insertComment(
      config,
      project,
      issue,
      options.comment_text || "コメントを同期してください",
      options.backlog_comment_id
    );
    const commentTranslation = CisApi.createTranslationQueueItem({
      config,
      input: {
        project_id: project.id,
        issue_id: issue.id,
        comment_id: comment.id,
        target_type: "comment",
        source_text: comment.content_original,
      },
    });
    TranslationApi.saveTranslationDraft({
      config,
      queueId: commentTranslation.id,
      draftText: `VI: ${comment.content_original}`,
      editedBy: 1,
      reviewNotes: "verify",
    });
    TranslationApi.approveTranslation({ config, queueId: commentTranslation.id, reviewedBy: 1, reviewNotes: "verify" });
  }

  return {
    issue: CisApi.getIssueById({ config, issueId: issue.id }),
    comment,
  };
}

function createApprovedMapping(config, projectId, mappingType, fromValue, cisValue, jiraValue) {
  const backlogToCis = MappingApi.createMappingRule({
    config,
    input: {
      project_id: projectId,
      mapping_type: mappingType,
      direction_from: "backlog",
      direction_to: "cis",
      from_value: fromValue,
      to_value: cisValue,
    },
  });
  MappingApi.approveMappingRule({
    config,
    ruleId: backlogToCis.id,
    approvedBy: 1,
  });

  const cisToJira = MappingApi.createMappingRule({
    config,
    input: {
      project_id: projectId,
      mapping_type: mappingType,
      direction_from: "cis",
      direction_to: "jira",
      from_value: cisValue,
      to_value: jiraValue,
    },
  });
  MappingApi.approveMappingRule({
    config,
    ruleId: cisToJira.id,
    approvedBy: 1,
  });
}

function seedRequiredMappings(config, project) {
  createApprovedMapping(config, project.id, "issue_type", "Task", "task", "Task");
  createApprovedMapping(config, project.id, "status", "Resolved", "resolved", "Done");
  createApprovedMapping(config, project.id, "priority", "Normal", "normal", "Medium");
}

async function requestJiraSyncAfterDryRun(config, issueId) {
  const dryRun = JiraApi.runJiraDryRun({
    config,
    issueId,
    executedBy: 1,
  });
  assert.equal(dryRun.can_sync, true);

  return JiraApi.requestJiraSync({
    config,
    issueId,
    executedBy: 1,
  });
}

async function login(server, name) {
  const response = await requestJson(server, {
    method: "POST",
    pathname: "/api/v1/auth/login",
    body: {
      email: `${name}@example.test`,
      password: "verify-password",
    },
  });
  assert.equal(response.status, 200);
  return response.body.data.token;
}

function listJournal(config, jobId) {
  return SyncApi.listJournal({
    config,
    filters: { sync_job_id: jobId },
  });
}

function getComment(config, commentId) {
  const db = createConnection({ config });
  const row = db.prepare("SELECT * FROM issue_comments WHERE id = ?").get(commentId);
  db.close();
  return row;
}

function getAnomalies(config, issueId) {
  const db = createConnection({ config });
  const rows = db.prepare("SELECT * FROM anomaly_log WHERE issue_id = ? ORDER BY id ASC").all(issueId);
  db.close();
  return rows;
}

async function verifyEndpointAndCreateFlow() {
  const name = "jira-outbound-create";
  const config = setupConfig(name);
  writeFakeState(config);
  const project = createProject(config, "PH6A");
  seedRequiredMappings(config, project);
  const ready = createReadyIssue(config, project, {
    summary: "Canonical summary",
    description: "Canonical plain text",
    assignee: "tanaka@example.test",
    assignee_account_id: "jira-account-1",
    due_date: "2026-07-31",
  });
  const app = createApp({ config });

  await withServer(app, async (server) => {
    const token = await login(server, name);
    const dryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${ready.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(dryRun.status, 200);
    assert.equal(dryRun.body.data.can_sync, true);
    assert.equal(dryRun.body.data.payload.fields.summary, "VI: Canonical summary");
    assert.equal(dryRun.body.data.payload.fields.description, "VI: Canonical plain text");
    assert.equal(dryRun.body.data.payload.fields.assignee.accountId, "jira-account-1");
    assert.equal(dryRun.body.data.payload.fields.duedate, "2026-07-31");
    assert.ok(!Object.prototype.hasOwnProperty.call(dryRun.body.data.payload.fields, "labels"));
    assert.ok(dryRun.body.data.canonical_hash.startsWith("sha256:"));

    const syncResponse = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${ready.issue.id}/sync/jira`,
      token,
    });
    assert.equal(syncResponse.status, 202);
    assert.equal(syncResponse.body.data.job_type, "push_issue");
    assert.equal(syncResponse.body.data.direction_from, "cis");
    assert.equal(syncResponse.body.data.direction_to, "jira");

    const pushIssueResult = await SyncApi.runWorkerOnce({ config, workerId: "jira-outbound-create" });
    assert.equal(pushIssueResult.job.status, "success");

    const savedIssue = CisApi.getIssueById({ config, issueId: ready.issue.id });
    assert.equal(savedIssue.status, "synced");
    assert.ok(savedIssue.jira_issue_key);
    assert.ok(savedIssue.last_synced_at);

    const fakeState = readFakeState(config);
    assert.equal(fakeState.issues.length, 1);
    assert.equal(fakeState.issues[0].key, savedIssue.jira_issue_key);
    assert.equal(fakeState.issues[0].summary, "VI: Canonical summary");
    assert.equal(fakeState.issues[0].description, "VI: Canonical plain text");
    assert.deepEqual(fakeState.issues[0].labels, []);
    assert.equal(fakeState.issues[0].assignee, "jira-account-1");
    assert.equal(fakeState.issues[0].due_date, "2026-07-31");

    const commentJob = SyncApi.listJobs({ config, filters: { status: "pending" } })
      .find((job) => job.job_type === "push_comment" && job.issue_id === ready.issue.id);
    assert.ok(commentJob);

    const pushCommentResult = await SyncApi.runWorkerOnce({ config, workerId: "jira-outbound-create" });
    assert.equal(pushCommentResult.job.status, "success");

    const syncedComment = getComment(config, ready.comment.id);
    assert.equal(syncedComment.sync_status, "synced");
    assert.ok(syncedComment.jira_comment_id);

    const afterCommentState = readFakeState(config);
    assert.equal(afterCommentState.issues[0].comments.length, 1);
    assert.match(afterCommentState.issues[0].comments[0].body, /^VI:/);
  });
}

async function verifyUpdateWithoutDuplicate() {
  const config = setupConfig("jira-outbound-update");
  writeFakeState(config);
  const project = createProject(config, "PH6B");
  seedRequiredMappings(config, project);
  const ready = createReadyIssue(config, project, { include_comment: false });

  const firstJob = await requestJiraSyncAfterDryRun(config, ready.issue.id);
  assert.equal(firstJob.job_type, "push_issue");
  const firstResult = await SyncApi.runWorkerOnce({ config, workerId: "jira-outbound-update" });
  assert.equal(firstResult.job.status, "success");

  const afterFirst = CisApi.getIssueById({ config, issueId: ready.issue.id });
  assert.ok(afterFirst.jira_issue_key);
  assert.equal(readFakeState(config).issues.length, 1);

  const secondJob = await requestJiraSyncAfterDryRun(config, ready.issue.id);
  assert.equal(secondJob.job_type, "push_issue");
  const secondResult = await SyncApi.runWorkerOnce({ config, workerId: "jira-outbound-update" });
  assert.equal(secondResult.job.status, "success");

  const state = readFakeState(config);
  assert.equal(state.issues.length, 1);
  assert.equal(state.issues[0].key, afterFirst.jira_issue_key);
  assert.ok(listJournal(config, secondJob.id).some((entry) => entry.action === "update"));
}

async function verifyLinkExistingTrace() {
  const config = setupConfig("jira-outbound-link");
  const project = createProject(config, "PH6C");
  seedRequiredMappings(config, project);
  const ready = createReadyIssue(config, project, { include_comment: false, backlog_issue_key: "PH6C-1" });
  writeFakeState(config, {
    issueCounter: 20,
    issues: [
      {
        id: "200",
        key: "DMP-77",
        summary: "[PH6C-1] Existing Jira issue",
        description: `CIS Sync Trace\n- CIS Issue ID: ${ready.issue.id}\n- Backlog Issue Key: PH6C-1\n- Source: backlog`,
        labels: ["cis-sync", "backlog-ph6c-1"],
        status: "To Do",
        comments: [],
      },
    ],
  });

  await requestJiraSyncAfterDryRun(config, ready.issue.id);
  assert.equal(CisApi.getIssueById({ config, issueId: ready.issue.id }).jira_issue_key, "DMP-77");
  const result = await SyncApi.runWorkerOnce({ config, workerId: "jira-outbound-link" });
  assert.equal(result.job.status, "success");

  const saved = CisApi.getIssueById({ config, issueId: ready.issue.id });
  assert.equal(saved.jira_issue_key, "DMP-77");
  assert.equal(readFakeState(config).issues.length, 1);
}

async function verifyTraceConflict() {
  const config = setupConfig("jira-outbound-conflict");
  const project = createProject(config, "PH6D");
  seedRequiredMappings(config, project);
  const ready = createReadyIssue(config, project, { include_comment: false, backlog_issue_key: "PH6D-1" });
  writeFakeState(config, {
    issues: [
      {
        id: "301",
        key: "DMP-10",
        summary: "[PH6D-1] First",
        description: `CIS Sync Trace\n- CIS Issue ID: ${ready.issue.id}`,
        labels: ["backlog-ph6d-1"],
        status: "To Do",
      },
      {
        id: "302",
        key: "DMP-11",
        summary: "[PH6D-1] Second",
        description: `CIS Sync Trace\n- CIS Issue ID: ${ready.issue.id}`,
        labels: ["backlog-ph6d-1"],
        status: "To Do",
      },
    ],
  });

  await assert.rejects(
    () => requestJiraSyncAfterDryRun(config, ready.issue.id),
    (error) => error.code === "JIRA_TRACE_CONFLICT"
  );

  const saved = CisApi.getIssueById({ config, issueId: ready.issue.id });
  assert.equal(saved.status, "conflict");
  assert.ok(getAnomalies(config, ready.issue.id).some((row) => row.anomaly_type === "unusual_field_change"));
  const conflictJournal = SyncApi.listJournal({ config, filters: { issue_id: ready.issue.id } });
  assert.ok(conflictJournal.some((entry) => entry.action === "jira_trace_conflict" && entry.sync_job_id === null));
  assert.equal(SyncApi.listJobs({ config, filters: { project_id: project.id } }).filter((item) => item.job_type === "push_issue").length, 0);
}

async function verifyMissingCredentialFailure() {
  const config = setupConfig("jira-outbound-credential-missing", {
    JIRA_FAKE_MODE: "",
  });
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Missing Credential",
      sync_enabled: true,
      backlog_project_key: "PH6E",
      backlog_issue_key_prefix: "PH6E",
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_site_url: "https://jira.example.test",
      jira_project_key: "DMP",
      jira_email: "",
      jira_api_token: "",
      source_language: "ja",
      target_language: "vi",
      require_translation_review: true,
      require_mapping_approval: true,
    },
  });
  seedRequiredMappings(config, project);
  const ready = createReadyIssue(config, project, { include_comment: false });

  const dryRun = JiraApi.runJiraDryRun({
    config,
    issueId: ready.issue.id,
    executedBy: 1,
  });
  assert.equal(dryRun.can_sync, false);
  assert.ok(dryRun.validation.errors.some((error) =>
    error.code === "JIRA_CONFIG_REQUIRED" &&
    error.details.missing.includes("jira_email") &&
    error.details.missing.includes("jira_api_token")
  ));
}

async function verifyRetryPolicies() {
  const config429 = setupConfig("jira-outbound-429");
  const project429 = createProject(config429, "PH6F");
  seedRequiredMappings(config429, project429);
  const ready429 = createReadyIssue(config429, project429, { include_comment: false });
  writeFakeState(config429, {
    failures: {
      createIssue: [
        {
          statusCode: 429,
          message: "Rate limited",
          retryAfterSeconds: 120,
        },
      ],
    },
  });

  const job429 = await requestJiraSyncAfterDryRun(config429, ready429.issue.id);
  const result429 = await SyncApi.runWorkerOnce({ config: config429, workerId: "jira-outbound-429" });
  assert.equal(result429.job.id, job429.id);
  assert.equal(result429.job.status, "pending");
  const retryJournal = listJournal(config429, job429.id);
  assert.ok(retryJournal.some((entry) => entry.action === "job_retry_scheduled"));
  assert.ok(retryJournal.some((entry) => entry.details_json.retry_after_seconds === 120));

  const config5xx = setupConfig("jira-outbound-5xx");
  const project5xx = createProject(config5xx, "PH6G");
  seedRequiredMappings(config5xx, project5xx);
  const ready5xx = createReadyIssue(config5xx, project5xx, { include_comment: false });
  writeFakeState(config5xx, {
    failures: {
      createIssue: [
        {
          statusCode: 503,
          message: "Temporary upstream error",
        },
      ],
    },
  });
  await requestJiraSyncAfterDryRun(config5xx, ready5xx.issue.id);
  const result5xx = await SyncApi.runWorkerOnce({ config: config5xx, workerId: "jira-outbound-5xx" });
  assert.equal(result5xx.job.status, "pending");

  const configTimeout = setupConfig("jira-outbound-timeout");
  const projectTimeout = createProject(configTimeout, "PH6H");
  seedRequiredMappings(configTimeout, projectTimeout);
  const readyTimeout = createReadyIssue(configTimeout, projectTimeout, { include_comment: false });
  writeFakeState(configTimeout, {
    failures: {
      createIssue: [
        {
          statusCode: 504,
          message: "Timed out",
        },
      ],
    },
  });
  await requestJiraSyncAfterDryRun(configTimeout, readyTimeout.issue.id);
  const resultTimeout = await SyncApi.runWorkerOnce({ config: configTimeout, workerId: "jira-outbound-timeout" });
  assert.equal(resultTimeout.job.status, "pending");

  const config4xx = setupConfig("jira-outbound-4xx");
  const project4xx = createProject(config4xx, "PH6I");
  seedRequiredMappings(config4xx, project4xx);
  const ready4xx = createReadyIssue(config4xx, project4xx, { include_comment: false });
  writeFakeState(config4xx, {
    failures: {
      createIssue: [
        {
          statusCode: 400,
          message: "Bad request",
          retryable: false,
        },
      ],
    },
  });
  await requestJiraSyncAfterDryRun(config4xx, ready4xx.issue.id);
  const result4xx = await SyncApi.runWorkerOnce({ config: config4xx, workerId: "jira-outbound-4xx" });
  assert.equal(result4xx.job.status, "failed");
}

async function verifyRetryAndCancelApi() {
  const name = "jira-outbound-retry-cancel";
  const config = setupConfig(name);
  const project = createProject(config, "PH6J");
  seedRequiredMappings(config, project);
  const ready = createReadyIssue(config, project, { include_comment: false });
  writeFakeState(config, {
    failures: {
      createIssue: [
        {
          statusCode: 400,
          message: "Invalid payload",
          retryable: false,
        },
      ],
    },
  });
  const app = createApp({ config });

  await withServer(app, async (server) => {
    const token = await login(server, name);
    const firstDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${ready.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(firstDryRun.status, 200);
    assert.equal(firstDryRun.body.data.can_sync, true);

    const firstSync = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${ready.issue.id}/sync/jira`,
      token,
    });
    assert.equal(firstSync.status, 202);
    const failedJobId = firstSync.body.data.id;
    const failedResult = await SyncApi.runWorkerOnce({ config, workerId: "jira-outbound-retry-cancel" });
    assert.equal(failedResult.job.id, failedJobId);
    assert.equal(failedResult.job.status, "failed");

    const retried = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/sync-jobs/${failedJobId}/retry`,
      token,
    });
    assert.equal(retried.status, 200);
    assert.equal(retried.body.data.status, "pending");

    const queuedIssue = createReadyIssue(config, project, { include_comment: false });
    const queuedDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${queuedIssue.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(queuedDryRun.status, 200);
    assert.equal(queuedDryRun.body.data.can_sync, true);

    const queued = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/issues/${queuedIssue.issue.id}/sync/jira`,
      token,
    });
    assert.equal(queued.status, 202);

    const cancelled = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/sync-jobs/${queued.body.data.id}/cancel`,
      token,
    });
    assert.equal(cancelled.status, 200);
    assert.equal(cancelled.body.data.status, "cancelled");
  });
}

async function main() {
  verifyMarkdownToAdf();
  await verifyJiraMappingUserPullKeepsHiddenUsers();
  await verifyEndpointAndCreateFlow();
  await verifyUpdateWithoutDuplicate();
  await verifyLinkExistingTrace();
  await verifyTraceConflict();
  await verifyMissingCredentialFailure();
  await verifyRetryPolicies();
  await verifyRetryAndCancelApi();

  console.log("Jira outbound verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
