const assert = require("assert");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const { ISSUE_STATUSES } = require("../../src/shared/stateConstants");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");
const { installFakeAiFetch } = require("./helpers/fake-ai-fetch");

function setupConfig() {
  const config = makeTempConfig("issue-editor-api", {
    ADMIN_EMAIL: "issue-editor@example.test",
    ADMIN_PASSWORD: "verify-password",
    DEEPSEEK_API_KEY: "issue-editor-test-key",
  });

  ensureStorage(config.storage);
  migrate({ config });
  installFakeAiFetch();
  AuthApi.bootstrapAdmin({
    config,
    email: "issue-editor@example.test",
    password: "verify-password",
  });

  return config;
}

function createProject(config) {
  return ProjectsApi.createProject({
    config,
    input: {
      name: "Issue Editor Verify",
      enabled: true,
      sync_enabled: true,
      backlog_project_key: "IE",
      backlog_issue_key_prefix: "IE",
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_project_key: "IED",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_TOKEN",
      translation_provider: "deepseek",
      jira_mapping_values_json: {
        issue_type: ["Task", "Bug"],
        priority: ["High", "Medium"],
        status: ["To Do", "Done"],
      },
    },
  });
}

function createIssue(config, project, backlogIssueKey = "IE-1") {
  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: backlogIssueKey,
      jira_issue_key: backlogIssueKey.replace(/^IE/, "IED"),
      source_system: "backlog",
      status: ISSUE_STATUSES.APPROVED,
      fields_json: {
        summary: { backlog: "Original summary", jira: "Jira summary" },
        description: {
          backlog: "Backlog description",
          jira: {
            version: 1,
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Jira ADF description" }],
              },
            ],
          },
        },
        issue_type: { backlog: "Bug", jira: "Task" },
        status: { backlog: "Open", jira: "To Do" },
        priority: { backlog: "High", jira: "Medium" },
        assignee: { backlog: "tanaka@example.test", jira: "jira-account" },
        assignee_meta: {
          jira: {
            account_id: "jira-account",
            email: "jira-user@example.test",
          },
        },
        labels: { jira: ["do-not-expose"] },
        components: { jira: ["do-not-expose"] },
        fix_versions: { jira: ["do-not-expose"] },
      },
    },
  });

  CisApi.addRevision({
    config,
    input: {
      issue_id: issue.id,
      source_system: "backlog",
      summary: "Original summary",
      description: "Backlog description",
      issue_type: "Bug",
      priority: "High",
      assignee: "tanaka@example.test",
    },
  });

  return issue;
}

async function login(server) {
  const response = await requestJson(server, {
    method: "POST",
    pathname: "/api/v1/auth/login",
    body: {
      email: "issue-editor@example.test",
      password: "verify-password",
    },
  });

  assert.equal(response.status, 200);
  return response.body.data.token;
}

function readIssue(config, issueId) {
  const db = createConnection({ config });
  const row = db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
  db.close();
  return {
    ...row,
    fields_json: JSON.parse(row.fields_json),
  };
}

function createDraftTranslation(config, project, issue, draftText = "Bản dịch mô tả Backlog") {
  const item = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "issue",
      target_field: "description",
      source_text: "Backlog description",
    },
  });
  const db = createConnection({ config });
  db
    .prepare(
      `UPDATE translation_queue
       SET ai_draft = ?, review_status = 'ai_draft', confidence = 0.91
       WHERE id = ?`
    )
    .run(draftText, item.id);
  db.close();
  return item;
}

async function main() {
  const config = setupConfig();
  const project = createProject(config);
  const issue = createIssue(config, project);
  const olderTranslation = createDraftTranslation(config, project, issue, "Older description translation");
  const olderTranslationDb = createConnection({ config });
  olderTranslationDb
    .prepare(
      `UPDATE translation_queue
       SET reviewed_text = ?, review_status = 'approved'
       WHERE id = ?`
    )
    .run("Older description translation", olderTranslation.id);
  olderTranslationDb.close();
  const translation = createDraftTranslation(config, project, issue, "Latest description translation");
  const commentTranslation = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "comment",
      source_text: "Comment translation should not render in Issue Editor",
    },
  });
  const setupDb = createConnection({ config });
  setupDb
    .prepare("UPDATE translation_queue SET review_status = 'approved' WHERE id = ?")
    .run(commentTranslation.id);
  setupDb.close();
  const staleIssue = createIssue(config, project, "IE-3");
  CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: staleIssue.id,
      target_type: "issue",
      target_field: "description",
      source_text: "Old description line 1\nOld description line 2",
    },
  });
  const untranslatedIssue = createIssue(config, project, "IE-2");
  const placeholderIssue = createIssue(config, project, "IE-4");
  const app = createApp({ config });

  await withServer(app, async (server) => {
    const token = await login(server);

    const editor = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/editor`,
      token,
    });
    assert.equal(editor.status, 200);
    assert.equal(editor.body.data.issue.sync_status, ISSUE_STATUSES.APPROVED);
    assert.equal(editor.body.data.canonical.description.value, "Backlog description");
    assert.equal(editor.body.data.sources.description.jira, "Jira ADF description");
    assert.equal(editor.body.data.field_meta.profile, "jira_inspired");
    assert.ok(!editor.body.data.field_meta.readonly_fields.includes("labels"));
    assert.ok(!Object.prototype.hasOwnProperty.call(editor.body.data.field_meta.field_types, "components"));
    assert.deepEqual(editor.body.data.field_meta.catalogs.status, ["open", "in_progress", "review", "done"]);
    assert.equal(editor.body.data.translation.total, 2);
    assert.equal(editor.body.data.translation.pending, 2);
    const summaryPlaceholder = editor.body.data.translations.find((item) => item.target_field === "summary");
    const descriptionDraft = editor.body.data.translations.find((item) => item.target_field === "description");
    assert.equal(summaryPlaceholder.id, null);
    assert.equal(summaryPlaceholder.review_status, "pending");
    assert.equal(summaryPlaceholder.ai_draft, null);
    assert.equal(descriptionDraft.id, translation.id);
    assert.equal(descriptionDraft.target_type, "issue");
    assert.equal(descriptionDraft.review_status, "ai_draft");
    assert.equal(descriptionDraft.ai_draft, "Latest description translation");
    assert.equal(editor.body.data.collections.worklog_summary.count, 0);
    assert.equal(editor.body.data.assignee_meta.jira.account_id, "jira-account");
    assert.equal(editor.body.data.canonical.story_point.value, 1);
    assert.equal(editor.body.data.field_meta.field_types.story_point, "number");

    const translatedPlaceholder = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${placeholderIssue.id}/translations/translate`,
      token,
      body: { target_field: "summary" },
    });
    assert.equal(translatedPlaceholder.status, 200);
    assert.deepEqual(translatedPlaceholder.body.data.created_items.map((item) => item.target_field), ["summary"]);
    assert.equal(translatedPlaceholder.body.data.translations.find((item) => item.target_field === "summary").review_status, "ai_draft");

    const approvedDraftResponse = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${translation.id}/approve`,
      token,
      body: { review_notes: "issue-editor-approve" },
    });
    assert.equal(approvedDraftResponse.status, 200);
    assert.equal(approvedDraftResponse.body.data.review_status, "approved");

    const approvedIssue = readIssue(config, issue.id);
    assert.equal(approvedIssue.fields_json.description.backlog, "Backlog description");
    assert.equal(approvedIssue.fields_json.description.cis, "Latest description translation");

    const editorAfterApproval = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/editor`,
      token,
    });
    assert.equal(editorAfterApproval.status, 200);
    assert.equal(editorAfterApproval.body.data.canonical.description.value, "Latest description translation");
    const approvedDescription = editorAfterApproval.body.data.translations.find((item) => item.target_field === "description");
    assert.equal(approvedDescription.source_text, "Backlog description");
    assert.equal(approvedDescription.is_source_stale, false);

    const rejected = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}`,
      token,
      body: {
        labels: ["blocked"],
      },
    });
    assert.equal(rejected.status, 422);

    const invalidStoryPoint = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}`,
      token,
      body: { story_point: -1 },
    });
    assert.equal(invalidStoryPoint.status, 422);
    assert.equal(invalidStoryPoint.body.error.code, "INVALID_STORY_POINT");

    const patched = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}`,
      token,
      body: {
        summary: "【IE-1】Canonical summary【IE-1】",
        priority: "Medium",
        status: "done",
        due_date: "2026-07-31",
        story_point: "3.5",
        assignee: "user@example.test",
        assignee_meta: {
          jira_account_id: "account-123",
        },
        reason: "Verify canonical editor",
      },
    });
    assert.equal(patched.status, 200);
    assert.deepEqual(
      patched.body.data.changed_fields.sort(),
      ["assignee", "due_date", "priority", "status", "story_point", "summary"].sort()
    );
    assert.equal(patched.body.data.issue.sync_status, ISSUE_STATUSES.UPDATE_PENDING);

    const saved = readIssue(config, issue.id);
    assert.equal(saved.sync_status, ISSUE_STATUSES.UPDATE_PENDING);
    assert.equal(saved.fields_json.summary.backlog, "Original summary");
    assert.equal(saved.fields_json.summary.cis, "【IE-1】Canonical summary");
    assert.equal(saved.fields_json.description.cis, "Latest description translation");
    assert.equal(saved.fields_json.priority.backlog, "High");
    assert.equal(saved.fields_json.priority.cis, "Medium");
    assert.equal(saved.fields_json.status.backlog, "Open");
    assert.equal(saved.fields_json.status.cis, "done");
    assert.equal(saved.fields_json.due_date.cis, "2026-07-31");
    assert.equal(saved.fields_json.story_point.cis, 3.5);
    assert.equal(saved.fields_json.assignee_meta.cis.jira_account_id, "account-123");

    const translate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${untranslatedIssue.id}/translations/translate`,
      token,
    });
    assert.equal(translate.status, 200);
    assert.equal(translate.body.data.created_items.length, 2);
    assert.equal(translate.body.data.queued_jobs.length, 0);
    assert.equal(translate.body.data.translated_items.length, 2);
    assert.equal(translate.body.data.translations.length, 2);
    assert.deepEqual(translate.body.data.translations.map((item) => item.target_field).sort(), ["description", "summary"]);
    assert.ok(translate.body.data.translations.every((item) => item.review_status === "ai_draft"));
    assert.ok(translate.body.data.translations.every((item) => item.ai_draft.includes("[vi] ")));

    const directItem = translate.body.data.translations[0];
    const directBeforeDb = createConnection({ config });
    const directJobsBefore = directBeforeDb.prepare("SELECT COUNT(*) AS total FROM sync_jobs").get().total;
    directBeforeDb.close();
    const directItemTranslate = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${untranslatedIssue.id}/translations/${directItem.id}/translate`,
      token,
    });
    assert.equal(directItemTranslate.status, 200);
    assert.equal(directItemTranslate.body.data.item.review_status, "ai_draft");
    assert.ok(directItemTranslate.body.data.item.ai_draft.includes("[vi] "));
    assert.equal(directItemTranslate.body.data.queued_job_ids.length, 0);
    assert.equal(directItemTranslate.body.data.job, null);
    const directCheckDb = createConnection({ config });
    assert.equal(directCheckDb.prepare("SELECT COUNT(*) AS total FROM sync_jobs").get().total, directJobsBefore);
    directCheckDb.close();
    assert.equal(
      readIssue(config, untranslatedIssue.id).fields_json[directItem.target_field].cis,
      directItem.target_field === "summary" ? "Original summary" : "Backlog description"
    );

    const descriptionTranslation = translate.body.data.translations.find((item) => item.target_field === "description");
    const reviewedTranslation = await requestJson(server, {
      method: "PUT",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${descriptionTranslation.id}/draft`,
      token,
      body: {
        draft_text: "Reviewed description translation",
        review_notes: "issue-editor-reviewed",
      },
    });
    assert.equal(reviewedTranslation.status, 200);
    assert.equal(reviewedTranslation.body.data.review_status, "ai_draft");
    const reviewedIssue = readIssue(config, untranslatedIssue.id);
    assert.notEqual(reviewedIssue.fields_json.description.cis, "Reviewed description translation");
    const approvedTranslation = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${descriptionTranslation.id}/approve`,
      token,
      body: { review_notes: "issue-editor-approved" },
    });
    assert.equal(approvedTranslation.status, 200);
    assert.equal(readIssue(config, untranslatedIssue.id).fields_json.description.cis, "Reviewed description translation");

    const patchedStaleIssue = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/projects/${project.id}/issues/${staleIssue.id}`,
      token,
      body: {
        description: "Current description from editor",
      },
    });
    assert.equal(patchedStaleIssue.status, 200);

    const staleEditor = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${staleIssue.id}/editor`,
      token,
    });
    assert.equal(staleEditor.status, 200);
    const staleDescription = staleEditor.body.data.translations.find((item) => item.target_field === "description");
    assert.equal(staleDescription.source_text, "Backlog description");
    assert.equal(staleDescription.source_text_original, "Old description line 1\nOld description line 2");
    assert.equal(staleDescription.is_source_stale, true);

    const refreshedStaleTranslation = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${staleIssue.id}/translations/translate`,
      token,
    });
    assert.equal(refreshedStaleTranslation.status, 200);
    assert.ok(refreshedStaleTranslation.body.data.translated_items.length >= 1);
    assert.ok(refreshedStaleTranslation.body.data.created_items.some((item) =>
      item.target_field === "description" &&
      item.source_text === "Backlog description"
    ));
    const currentDescriptionTranslation = refreshedStaleTranslation.body.data.translations.find((item) =>
      item.target_field === "description"
    );
    assert.equal(currentDescriptionTranslation.review_status, "ai_draft");
    assert.equal(currentDescriptionTranslation.ai_draft, "[vi] Backlog description");

    const history = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/history`,
      token,
    });
    assert.equal(history.status, 200);
    assert.ok(history.body.data.revisions.some((revision) => revision.source_system === "manual"));
    assert.ok(history.body.data.manual_edits.some((entry) => entry.details_json.reason === "Apply approved issue translation."));
    assert.ok(history.body.data.manual_edits.some((entry) => entry.details_json.reason === "Verify canonical editor"));

    const worklogs = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/worklogs`,
      token,
    });
    assert.equal(worklogs.status, 200);
    assert.equal(worklogs.body.data.summary.count, 0);
  });

  installFakeAiFetch({ mode: "fail-once" });
  const retryConfig = config;
  const retryProject = createProject(retryConfig);
  const retryIssue = createIssue(retryConfig, retryProject, "IE-4");
  const retryApp = createApp({ config: retryConfig });

  await withServer(retryApp, async (server) => {
    const token = await login(server);
    const response = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${retryProject.id}/issues/${retryIssue.id}/translations/translate`,
      token,
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.translated_items.length, 2);
    assert.ok(response.body.data.translations.every((item) => item.review_status === "ai_draft"));
  });

  console.log("Issue Editor API verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
