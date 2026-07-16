const assert = require("assert");
const crypto = require("crypto");
const http = require("http");
const path = require("path");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const MappingApi = require("../../src/modules/Mapping/MappingApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const TranslationApi = require("../../src/modules/Translation/TranslationApi");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function setupConfig() {
  const config = makeTempConfig("admin-ui-acceptance", {
    ADMIN_EMAIL: "admin-ui@example.test",
    ADMIN_PASSWORD: "verify-password",
    BACKLOG_FAKE_FIXTURE_PATH: path.join(process.cwd(), "scripts", "verify", "fixtures", "backlog-issue.json"),
    JIRA_FAKE_MODE: "1",
  });
  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({
    config,
    email: "admin-ui@example.test",
    password: "verify-password",
  });
  return config;
}

function requestText(server, pathname) {
  const { port } = server.address();

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: pathname,
        method: "GET",
      },
      (res) => {
        let rawBody = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          rawBody += chunk;
        });
        res.on("end", () => {
          resolve({
            body: rawBody,
            status: res.statusCode,
          });
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

async function login(server) {
  const response = await requestJson(server, {
    method: "POST",
    pathname: "/api/v1/auth/login",
    body: {
      email: "admin-ui@example.test",
      password: "verify-password",
    },
  });
  assert.equal(response.status, 200);
  assert.ok(response.body.data.token);
  return response.body.data.token;
}

function createProject(config) {
  return ProjectsApi.createProject({
    config,
    input: {
      name: "Admin UI Seed",
      enabled: true,
      sync_enabled: true,
      backlog_space_url: "https://backlog.example.test",
      backlog_project_key: "ADM",
      backlog_issue_key_prefix: "ADM",
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_site_url: "https://jira.example.test",
      jira_project_key: "ADM",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_API_TOKEN",
      source_language: "ja",
      target_language: "vi",
      require_translation_review: true,
      require_mapping_approval: true,
      cis_mapping_values_json: {
        issue_type: ["bug", "task"],
        status: ["open", "done"],
        priority: ["high", "normal"],
        user: ["seed-user@example.test"],
      },
      backlog_mapping_values_json: {
        issue_type: ["Bug", "Task"],
        status: ["Open", "Closed"],
        priority: ["High", "Normal"],
      },
      jira_mapping_values_json: {
        issue_type: ["Bug", "Task"],
        status: ["To Do", "Done"],
        priority: ["High", "Medium"],
      },
    },
  });
}

function createIssue(config, project) {
  const summary = "Login screen shows error";
  const description = "Save action returns a server error.";
  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: "ADM-1",
      source_system: "backlog",
      status: "pending_translate",
      fields_json: {
        summary: { backlog: summary },
        description: { backlog: description },
        issue_type: { backlog: "Bug" },
        status: { backlog: "Open" },
        priority: { backlog: "High" },
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
      issue_type: "Bug",
      priority: "High",
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
    queueId: descriptionTranslation.id,
    draftText: "VI: Save action returns a server error.",
    editedBy: 1,
    reviewNotes: "verify",
  });
  TranslationApi.approveTranslation({ config, queueId: descriptionTranslation.id, reviewedBy: 1, reviewNotes: "verify" });

  const db = createConnection({ config });
  db
    .prepare(
      `UPDATE translation_queue
       SET ai_draft = ?, review_status = 'ai_draft', updated_at = datetime('now')
       WHERE id = ?`
    )
    .run("VI: Login screen shows error", summaryTranslation.id);
  db
    .prepare(
      `INSERT INTO issue_attachments (
        id,
        project_id,
        issue_id,
        source_system,
        backlog_attachment_id,
        original_filename,
        download_status,
        sync_status
      )
      VALUES (?, ?, ?, 'backlog', ?, ?, 'downloaded', 'pending')`
    )
    .run(crypto.randomUUID(), project.id, issue.id, "att-1", "evidence.txt");
  db.close();

  return {
    descriptionTranslation,
    issue: CisApi.getIssueById({ config, issueId: issue.id }),
    summaryTranslation,
  };
}

function approveMapping(config, projectId, mappingType, fromValue, cisValue, jiraValue) {
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

function seedSupportData(config, project, issue) {
  approveMapping(config, project.id, "issue_type", "Bug", "bug", "Bug");
  approveMapping(config, project.id, "status", "Open", "open", "To Do");
  approveMapping(config, project.id, "priority", "High", "high", "High");

  SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      direction_from: "backlog",
      direction_to: "cis",
      job_type: "manual_pull",
      payload_json: { backlog_issue_key: issue.backlog_issue_key },
      trigger: "manual",
      max_attempts: 1,
    },
  });
  const successJob = SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "noop_test",
      payload_json: { verify: "phase07-success-time" },
      trigger: "system",
      max_attempts: 1,
    },
  });

  const db = createConnection({ config });
  db
    .prepare(
      `UPDATE sync_jobs
       SET status = 'success', updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(successJob.id);
  db
    .prepare(
      `INSERT INTO sync_journal (
        sync_job_id,
        project_id,
        issue_id,
        direction_from,
        direction_to,
        job_type,
        action,
        status,
        trigger,
        message
      )
      VALUES (?, ?, ?, 'cis', 'jira', 'noop_test', 'job_success', 'success', 'system', 'Verify success timestamp.')`
    )
    .run(successJob.id, project.id, issue.id);
  db
    .prepare(
      `INSERT INTO anomaly_log (
        project_id,
        issue_id,
        anomaly_type,
        severity,
        status,
        details_json
      )
      VALUES (?, ?, 'mapping_gap', 'warning', 'open', ?)`
    )
    .run(
      project.id,
      issue.id,
      JSON.stringify({
        mapping_type: "component",
        from_value: "UI",
      })
    );
  db.close();
}

async function verifyPhase07() {
  const config = setupConfig();
  const project = createProject(config);
  const { issue, summaryTranslation } = createIssue(config, project);
  seedSupportData(config, project, issue);
  const app = createApp({ config });

  await withServer(app, async (server) => {
    const legacyPath = `/${["ad", "min"].join("")}`;
    const legacyPage = await requestText(server, `${legacyPath}/`);
    assert.equal(legacyPage.status, 404);
    const legacyScript = await requestText(server, `${legacyPath}/app.js`);
    assert.equal(legacyScript.status, 404);

    const token = await login(server);

    const me = await requestJson(server, {
      pathname: "/api/v1/auth/me",
      token,
    });
    assert.equal(me.status, 200);
    assert.equal(me.body.data.admin.email, "admin-ui@example.test");

    const createdProject = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/projects",
      token,
      body: {
        name: "Admin UI Created",
        backlog_project_key: "NEW",
        backlog_issue_key_prefix: "NEW",
        backlog_api_key_env: "BACKLOG_API_KEY",
        jira_project_key: "NEW",
        jira_email_env: "JIRA_EMAIL",
        jira_api_token_env: "JIRA_API_TOKEN",
      },
    });
    assert.equal(createdProject.status, 201);

    const updatedProject = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/projects/${createdProject.body.data.id}`,
      token,
      body: {
        name: "Admin UI Updated",
        sync_enabled: true,
      },
    });
    assert.equal(updatedProject.status, 200);
    assert.equal(updatedProject.body.data.name, "Admin UI Updated");
    assert.equal(updatedProject.body.data.sync_enabled, true);

    const issues = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues`,
      token,
    });
    assert.equal(issues.status, 200);
    assert.ok(issues.body.data.items.some((row) => row.id === issue.id));

    const detail = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}`,
      token,
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.issue.backlog_issue_key, "ADM-1");
    assert.equal(detail.body.data.translations.length, 2);
    assert.equal(detail.body.data.attachments.length, 1);

    const attachments = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/attachments`,
      token,
    });
    assert.equal(attachments.status, 200);
    assert.equal(attachments.body.data[0].original_filename, "evidence.txt");

    const approve = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-queue/${summaryTranslation.id}/approve`,
      token,
      body: { review_notes: "verify phase07" },
    });
    assert.equal(approve.status, 200);
    assert.equal(approve.body.data.review_status, "approved");

    const dryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(dryRun.status, 200);
    assert.equal(dryRun.body.data.can_sync, true);
    assert.equal(dryRun.body.data.payload.fields.summary, "【ADM-1】VI: Login screen shows error");
    assert.ok(Array.isArray(dryRun.body.data.warnings));

    const mappings = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/mapping-rules`,
      token,
    });
    assert.equal(mappings.status, 200);
    assert.ok(mappings.body.data.length >= 6);

    const pulledBacklogValues = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/mapping-values/pull`,
      token,
    });
    assert.equal(pulledBacklogValues.status, 200);
    assert.ok(pulledBacklogValues.body.data.backlog_mapping_values_json.user.includes("tanaka@example.test"));
    assert.ok(pulledBacklogValues.body.data.backlog_mapping_values_json.issue_type_directory.some((item) => item.value === "Bug"));
    assert.ok(pulledBacklogValues.body.data.backlog_mapping_values_json.status_directory.some((status) => status.name === "Open"));
    assert.ok(pulledBacklogValues.body.data.backlog_mapping_values_json.priority_directory.some((item) => item.value === "High"));
    assert.ok(pulledBacklogValues.body.data.backlog_mapping_values_json.user_directory.some((user) => user.name === "Tanaka"));
    assert.ok(pulledBacklogValues.body.data.backlog_mapping_values_json.component_directory.some((item) => item.value === "Frontend"));
    assert.deepEqual(pulledBacklogValues.body.data.project.cis_mapping_values_json.user, ["seed-user@example.test"]);

    const pulledJiraValues = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/jira/mapping-values/pull`,
      token,
    });
    assert.equal(pulledJiraValues.status, 200);
    assert.ok(pulledJiraValues.body.data.jira_mapping_values_json.component.includes("Frontend"));
    assert.ok(pulledJiraValues.body.data.jira_mapping_values_json.user.includes("fake-jira-user@example.test"));
    assert.ok(!pulledJiraValues.body.data.jira_mapping_values_json.user.includes("fake-jira-account-1"));
    assert.ok(pulledJiraValues.body.data.jira_mapping_values_json.issue_type_directory.some((item) => item.value === "Bug"));
    assert.ok(pulledJiraValues.body.data.jira_mapping_values_json.status_directory.some((item) => item.value === "To Do"));
    assert.ok(pulledJiraValues.body.data.jira_mapping_values_json.priority_directory.some((item) => item.value === "High"));
    assert.ok(pulledJiraValues.body.data.jira_mapping_values_json.user_directory.some((item) => item.value === "fake-jira-user@example.test"));
    assert.ok(pulledJiraValues.body.data.jira_mapping_values_json.component_directory.some((item) => item.value === "Frontend"));
    assert.deepEqual(pulledJiraValues.body.data.project.cis_mapping_values_json.issue_type, ["bug", "task"]);
    assert.deepEqual(pulledJiraValues.body.data.project.cis_mapping_values_json.user, ["seed-user@example.test"]);

    const syncedCisValues = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/cis/mapping-values/sync`,
      token,
      body: { target_system: "jira" },
    });
    assert.equal(syncedCisValues.status, 200);
    assert.ok(syncedCisValues.body.data.warnings.some((warning) => warning.mapping_type === "issue_type"));
    assert.ok(syncedCisValues.body.data.warnings.some((warning) => warning.mapping_type === "user"));
    const issueTypeWarning = syncedCisValues.body.data.warnings.find((warning) => warning.mapping_type === "issue_type");
    assert.deepEqual(issueTypeWarning.previous_values, ["bug", "task"]);
    assert.deepEqual(issueTypeWarning.next_values, ["Bug", "Task", "Story"]);
    assert.deepEqual(syncedCisValues.body.data.cis_mapping_values_json.issue_type, ["Bug", "Task", "Story"]);
    assert.deepEqual(syncedCisValues.body.data.cis_mapping_values_json.status, ["To Do", "In Progress", "Done"]);
    assert.deepEqual(syncedCisValues.body.data.cis_mapping_values_json.priority, ["Low", "Medium", "High"]);
    assert.deepEqual(syncedCisValues.body.data.cis_mapping_values_json.component, ["Frontend", "Backend"]);
    assert.deepEqual(syncedCisValues.body.data.cis_mapping_values_json.user, ["fake-jira-user@example.test"]);

    const mappingSettings = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/mapping-settings?source_system=backlog&target_system=jira`,
      token,
    });
    assert.equal(mappingSettings.status, 200);
    assert.ok(mappingSettings.body.data.flows.systems_to_cis.some((row) => row.from_value === "Bug"));
    assert.ok(mappingSettings.body.data.flows.cis_to_system.some((row) => row.from_value === "Bug"));
    assert.ok(!mappingSettings.body.data.flows.cis_to_system.some((row) => row.from_value === "bug"));
    const sourceSetting = mappingSettings.body.data.flows.systems_to_cis.find((row) => row.from_value === "Bug");
    assert.ok(sourceSetting.system_values.some((option) => option.value === "Task"));
    assert.deepEqual(sourceSetting.cis_values.map((option) => option.value), ["Bug", "Task", "Story"]);
    const targetSetting = mappingSettings.body.data.flows.cis_to_system.find((row) => row.from_value === "Bug");
    assert.ok(targetSetting.system_values.some((option) => option.value === "Bug"));
    assert.ok(mappingSettings.body.data.flows.cis_to_system.some((row) =>
      row.mapping_type === "user" && row.from_value === "fake-jira-user@example.test"
    ));

    const anomalies = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/anomalies?issue_id=${issue.id}`,
      token,
    });
    assert.equal(anomalies.status, 200);
    assert.ok(anomalies.body.data.some((row) => row.anomaly_type === "mapping_gap"));

    const jobs = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/sync-jobs`,
      token,
    });
    assert.equal(jobs.status, 200);
    assert.ok(jobs.body.data.every((row) => row.project_id === project.id));
    const manualPullJob = jobs.body.data.find((row) => row.job_type === "manual_pull");
    assert.ok(manualPullJob);
    assert.equal(manualPullJob.issue_id, null);
    assert.equal(manualPullJob.issue_reference, "ADM-1");
    assert.equal(manualPullJob.source_issue_key, "ADM-1");
    assert.equal(manualPullJob.target_issue_key, "ADM-1");
    const successJob = jobs.body.data.find((row) => row.job_type === "noop_test");
    assert.ok(successJob);
    assert.ok(successJob.created_at);
    assert.ok(successJob.success_at);
    assert.equal(successJob.source_issue_key, "ADM-1");
    assert.equal(successJob.target_issue_key, "");

    const allJournal = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/sync-journal`,
      token,
    });
    assert.equal(allJournal.status, 200);
    assert.ok(allJournal.body.data.every((row) => row.project_id === project.id));
    const manualPullJournal = allJournal.body.data.find((row) =>
      row.sync_job_id === manualPullJob.id && row.action === "job_enqueued"
    );
    assert.ok(manualPullJournal);
    assert.equal(manualPullJournal.issue_id, null);
    assert.equal(manualPullJournal.issue_reference, "ADM-1");
    assert.equal(manualPullJournal.source_issue_key, "ADM-1");
    assert.equal(manualPullJournal.target_issue_key, "ADM-1");

    const journal = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/issues/${issue.id}/sync-journal`,
      token,
    });
    assert.equal(journal.status, 200);
    assert.ok(journal.body.data.some((row) => row.action === "job_enqueued"));
    const successJournal = journal.body.data.find((row) => row.action === "job_success");
    assert.ok(successJournal);
    assert.ok(successJournal.created_at);
    assert.ok(successJournal.success_at);

    const summary = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/dashboard/summary`,
      token,
    });
    assert.equal(summary.status, 200);
    assert.equal(summary.body.data.counts.pull_jobs_pending, 1);
    assert.equal(summary.body.data.counts.translation_pending, 0);
    assert.equal(summary.body.data.counts.issue_pending_mapping, 1);
    assert.equal(summary.body.data.counts.anomaly_open, 1);
    assert.equal(Object.hasOwn(summary.body.data.counts, "projects_enabled"), false);

    const alerts = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/dashboard/alerts`,
      token,
    });
    assert.equal(alerts.status, 200);
    assert.ok(alerts.body.data.some((row) => row.type === "anomaly_open"));
  });
}

verifyPhase07()
  .then(() => {
    console.log("Admin UI acceptance verification passed.");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
