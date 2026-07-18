const assert = require("assert");
const crypto = require("crypto");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const { createVerifyProject } = require("./helpers/project");
const TranslationApi = require("../../src/modules/Translation/TranslationApi");
const { makeTempConfig } = require("./helpers/tempConfig");
const { requestJson, withServer } = require("./helpers/http");

function setupConfig(name) {
  const config = makeTempConfig(name, {
    ADMIN_EMAIL: `${name}@example.test`,
    ADMIN_PASSWORD: "verify-password",
  });
  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapSystemAdmin({
    config,
    email: `${name}@example.test`,
    password: "verify-password",
  });
  return config;
}

function createProject(config, suffix, overrides = {}) {
  return createVerifyProject({
    config,
    input: {
      name: `Dry-run Verify ${suffix}`,
      sync_enabled: true,
      backlog_project_key: suffix,
      backlog_issue_key_prefix: suffix,
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_site_url: "https://jira.example.test",
      jira_project_key: suffix,
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_API_TOKEN",
      source_language: "ja",
      target_language: "vi",
      auto_translate: true,
      require_translation_review: true,
      require_mapping_approval: true,
      cis_mapping_values_json: {
        issue_type: ["bug", "task"],
        status: ["open", "done"],
        priority: ["high", "normal"],
        user: ["assignee@example.test", "reporter@example.test"],
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
        user: ["jira-account-1"],
        user_labels: {
          "jira-account-1": "Jira Display User",
        },
      },
      ...overrides,
    },
  });
}

function createIssueWithRevision(config, project, overrides = {}) {
  const key = overrides.backlog_issue_key || `${project.backlog_project_key}-${Math.floor(Math.random() * 100000)}`;
  const summary = overrides.summary || "ログイン画面を確認してください";
  const description = overrides.description || "送信後にエラーが表示されます。";
  const issueType = overrides.issue_type || "Bug";
  const status = overrides.status || "Open";
  const priority = overrides.priority || "High";
  const assignee = overrides.assignee === undefined ? null : overrides.assignee;

  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: key,
      source_system: "backlog",
      status: overrides.issue_status || "pending_translate",
      fields_json: {
        summary: { backlog: summary },
        description: { backlog: description },
        issue_type: { backlog: issueType },
        status: { backlog: status },
        priority: { backlog: priority },
        assignee: { backlog: assignee },
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

  const shouldCreateTranslations = overrides.create_translations !== false;
  const summaryTranslation = shouldCreateTranslations
    ? CisApi.createTranslationQueueItem({
      config,
      input: {
        project_id: project.id,
        issue_id: issue.id,
        target_type: "issue",
        target_field: "summary",
        source_text: summary,
      },
    })
    : null;
  const descriptionTranslation = shouldCreateTranslations
    ? CisApi.createTranslationQueueItem({
      config,
      input: {
        project_id: project.id,
        issue_id: issue.id,
        target_type: "issue",
        target_field: "description",
        source_text: description,
      },
    })
    : null;

  return {
    descriptionTranslation,
    issue: CisApi.getIssueById({ config, issueId: issue.id }),
    summaryTranslation,
  };
}

function reviewTranslations(config, items) {
  for (const item of items) {
    TranslationApi.saveTranslationDraft({
      config,
      queueId: item.id,
      draftText: `VI: ${item.source_text}`,
      editedBy: 1,
      reviewNotes: "verify",
    });
    TranslationApi.approveTranslation({ config, queueId: item.id, reviewedBy: 1, reviewNotes: "verify" });
  }
}

function insertAttachment(config, project, issue, input = {}) {
  const db = createConnection({ config });
  const id = input.id || crypto.randomUUID();
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
        sync_status,
        error_message
      )
      VALUES (?, ?, ?, 'backlog', ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      project.id,
      issue.id,
      input.backlog_attachment_id || String(Math.floor(Math.random() * 1000000)),
      input.original_filename || "evidence.png",
      input.download_status || "pending",
      input.sync_status || "pending",
      input.error_message || null
    );
  db.close();
  return id;
}

function listAnomalies(config, issueId, type) {
  const db = createConnection({ config });
  const rows = db
    .prepare("SELECT * FROM anomaly_log WHERE issue_id = ? AND anomaly_type = ? ORDER BY id ASC")
    .all(issueId, type);
  db.close();
  return rows;
}

async function login(server, name) {
  const login = await requestJson(server, {
    method: "POST",
    pathname: "/api/v1/auth/login",
    body: {
      email: `${name}@example.test`,
      password: "verify-password",
    },
  });
  assert.equal(login.status, 200);
  return login.body.data.token;
}

async function createAndApproveMapping(server, token, projectId, mappingType, from, cis, jira) {
  const backlogToCis = await requestJson(server, {
    method: "POST",
    pathname: `/api/v1/projects/${projectId}/mapping-rules`,
    token,
    body: {
      project_id: projectId,
      mapping_type: mappingType,
      direction_from: "backlog",
      direction_to: "cis",
      from_value: from,
      to_value: cis,
      source_type: "manual",
      approval_status: "pending",
      confidence: 1,
    },
  });
  assert.equal(backlogToCis.status, 201);

  const approveBacklogToCis = await requestJson(server, {
    method: "POST",
    pathname: `/api/v1/projects/${projectId}/mapping-rules/${backlogToCis.body.data.id}/approve`,
    token,
  });
  assert.equal(approveBacklogToCis.status, 200);
  assert.equal(approveBacklogToCis.body.data.approval_status, "approved");

  const cisToJira = await requestJson(server, {
    method: "POST",
    pathname: `/api/v1/projects/${projectId}/mapping-rules`,
    token,
    body: {
      project_id: projectId,
      mapping_type: mappingType,
      direction_from: "cis",
      direction_to: "jira",
      from_value: cis,
      to_value: jira,
      source_type: "manual",
      approval_status: "pending",
      confidence: 1,
    },
  });
  assert.equal(cisToJira.status, 201);

  const approveCisToJira = await requestJson(server, {
    method: "POST",
    pathname: `/api/v1/projects/${projectId}/mapping-rules/${cisToJira.body.data.id}/approve`,
    token,
  });
  assert.equal(approveCisToJira.status, 200);
  assert.equal(approveCisToJira.body.data.approval_status, "approved");
}

async function verifyApprovedMappingSave(server, token, projectId) {
  const created = await requestJson(server, {
    method: "POST",
    pathname: `/api/v1/projects/${projectId}/mapping-rules`,
    token,
    body: {
      project_id: projectId,
      mapping_type: "status",
      direction_from: "backlog",
      direction_to: "cis",
      from_value: "Resolved",
      to_value: "done",
      source_type: "manual",
      approval_status: "approved",
      confidence: 1,
    },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.approval_status, "approved");

  const updated = await requestJson(server, {
    method: "PATCH",
    pathname: `/api/v1/projects/${projectId}/mapping-rules/${created.body.data.id}`,
    token,
    body: {
      to_value: "closed",
      approval_status: "approved",
    },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.to_value, "closed");
  assert.equal(updated.body.data.approval_status, "approved");
}

function assertHasError(dryRun, code) {
  assert.ok(
    dryRun.body.data.validation.errors.some((error) => error.code === code),
    `Expected dry-run error ${code}`
  );
}

function assertHasWarning(dryRun, code) {
  assert.ok(
    dryRun.body.data.warnings.some((warning) => warning.code === code),
    `Expected dry-run warning ${code}`
  );
}

async function verifyPhase05() {
  const name = "mapping-anomaly-dryrun";
  const config = setupConfig(name);
  const project = createProject(config, "DRY");
  const app = createApp({ config });

  await withServer(app, async (server) => {
    const token = await login(server, name);
    await verifyApprovedMappingSave(server, token, project.id);

    const optionalTranslationProject = createProject(config, "OPT", {
      auto_translate: false,
      require_translation_review: false,
    });
    const optionalTranslationIssue = createIssueWithRevision(config, optionalTranslationProject, {
      backlog_issue_key: "OPT-1",
      create_translations: false,
      issue_status: "approved",
    });
    await createAndApproveMapping(server, token, optionalTranslationProject.id, "issue_type", "Bug", "bug", "Bug");
    await createAndApproveMapping(server, token, optionalTranslationProject.id, "status", "Open", "open", "To Do");
    await createAndApproveMapping(server, token, optionalTranslationProject.id, "priority", "High", "high", "High");
    const optionalTranslationDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${optionalTranslationProject.id}/issues/${optionalTranslationIssue.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(optionalTranslationDryRun.status, 200);
    assert.equal(optionalTranslationDryRun.body.data.can_sync, true);
    assert.ok(
      !optionalTranslationDryRun.body.data.validation.errors.some((error) => error.code === "TRANSLATION_REVIEW_REQUIRED"),
      "Translation review must not block when project disables require_translation_review"
    );

    const jiraSourceProject = createProject(config, "JSRC", {
      cis_mapping_values_json: {
        user: ["old-cis-user@example.test"],
      },
      jira_mapping_values_json: {
        user: [
          "jira-account-1",
          "jira-user@example.test",
          "Slack",
          "Atlas for Jira Cloud",
          "Automation for Jira",
          "Người dùng cũ",
        ],
        user_labels: {
          "jira-account-1": "Jira Account One",
          "jira-user@example.test": "Jira Email User",
          Slack: "Slack",
          "Atlas for Jira Cloud": "Atlas for Jira Cloud",
          "Automation for Jira": "Automation for Jira",
          "Người dùng cũ": "Người dùng cũ",
        },
        user_directory: [
          { id: "jira-account-1", value: "jira-account-1", name: "Jira Account One" },
          { id: "jira-email-account", value: "jira-user@example.test", name: "Jira Email User", email: "jira-user@example.test" },
          { id: "slack-account", value: "Slack", name: "Slack" },
        ],
      },
    });
    const syncedFromJira = await ProjectsApi.syncCisMappingValuesFromTarget({
      config,
      projectId: jiraSourceProject.id,
      actorUserId: jiraSourceProject.owner_user_id,
      targetSystem: "jira",
    });
    assert.deepEqual(syncedFromJira.cis_mapping_values_json.user, ["jira-account-1", "jira-user@example.test"]);
    assert.equal(syncedFromJira.cis_mapping_values_json.user_labels["jira-account-1"], "Jira Account One");
    assert.ok(!syncedFromJira.cis_mapping_values_json.user.includes("Slack"));
    assert.ok(!syncedFromJira.cis_mapping_values_json.user.includes("Atlas for Jira Cloud"));
    assert.ok(!syncedFromJira.cis_mapping_values_json.user.includes("Automation for Jira"));
    assert.ok(!syncedFromJira.cis_mapping_values_json.user.includes("Người dùng cũ"));
    assert.deepEqual(syncedFromJira.jira_mapping_values_json.user_directory, [
      { id: "jira-account-1", value: "jira-account-1", name: "Jira Account One" },
      { id: "jira-email-account", value: "jira-user@example.test", name: "Jira Email User", email: "jira-user@example.test" },
    ]);
    assert.equal(syncedFromJira.cis_mapping_values_json.user_directory, undefined);
    assert.ok(syncedFromJira.warnings.some((warning) => warning.mapping_type === "user"));

    const unreviewed = createIssueWithRevision(config, project, {
      backlog_issue_key: "DRY-1",
      issue_status: "approved",
    });
    await createAndApproveMapping(server, token, project.id, "issue_type", "Bug", "bug", "Bug");
    await createAndApproveMapping(server, token, project.id, "status", "Open", "open", "To Do");
    await createAndApproveMapping(server, token, project.id, "priority", "High", "high", "High");

    const unreviewedDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${unreviewed.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(unreviewedDryRun.status, 200);
    assert.equal(unreviewedDryRun.body.data.can_sync, true);
    assert.ok(
      !unreviewedDryRun.body.data.validation.errors.some((error) => error.code === "TRANSLATION_REVIEW_REQUIRED"),
      "Translation queue must not block canonical Jira dry-run"
    );

    const missingMapping = createIssueWithRevision(config, project, {
      backlog_issue_key: "DRY-2",
      issue_type: "Task",
      status: "Closed",
      priority: "Normal",
      assignee: "assignee@example.test",
    });
    reviewTranslations(config, [
      missingMapping.summaryTranslation,
      missingMapping.descriptionTranslation,
    ]);

    const missingMappingDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${missingMapping.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(missingMappingDryRun.status, 200);
    assert.equal(missingMappingDryRun.body.data.can_sync, false);
    assertHasError(missingMappingDryRun, "MAPPING_REQUIRED");
    assert.ok(
      missingMappingDryRun.body.data.validation.missing_required_mapping.length >= 3,
      "Expected required mapping gaps"
    );
    assert.ok(
      listAnomalies(config, missingMapping.issue.id, "mapping_gap").length >= 3,
      "Expected mapping_gap anomalies"
    );

    await createAndApproveMapping(server, token, project.id, "issue_type", "Task", "task", "Task");
    await createAndApproveMapping(server, token, project.id, "status", "Closed", "done", "Done");
    await createAndApproveMapping(server, token, project.id, "priority", "Normal", "normal", "Medium");
    await createAndApproveMapping(server, token, project.id, "user", "assignee@example.test", "assignee@example.test", "jira-assignee-1");

    const passDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${missingMapping.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(passDryRun.status, 200);
    assert.equal(passDryRun.body.data.can_sync, true);
    assert.equal(passDryRun.body.data.payload.fields.project.key, project.jira_project_key);
    assert.equal(passDryRun.body.data.payload.fields.issuetype.name, "Task");
    assert.equal(passDryRun.body.data.payload.fields.summary, "【DRY-2】VI: ログイン画面を確認してください");
    assert.ok(!Object.prototype.hasOwnProperty.call(passDryRun.body.data.payload.fields, "labels"));
    assert.equal(passDryRun.body.data.payload.fields.assignee.accountId, "jira-assignee-1");
    assert.equal(passDryRun.body.data.field_sources.summary, "cis");
    assert.ok(passDryRun.body.data.canonical_hash.startsWith("sha256:"));

    const critical = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/anomalies`,
      token,
      body: {
        project_id: project.id,
        issue_id: missingMapping.issue.id,
        anomaly_type: "unusual_field_change",
        severity: "critical",
        details_json: { field: "description" },
      },
    });
    assert.equal(critical.status, 201);

    const blockedDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${missingMapping.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(blockedDryRun.body.data.can_sync, false);
    assertHasError(blockedDryRun, "ANOMALY_BLOCKED");

    const ignored = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/anomalies/${critical.body.data.id}/ignore`,
      token,
    });
    assert.equal(ignored.status, 200);
    assert.equal(ignored.body.data.status, "ignored");

    const afterIgnoreDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${missingMapping.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(afterIgnoreDryRun.body.data.can_sync, true);

    const secondCritical = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/anomalies`,
      token,
      body: {
        project_id: project.id,
        issue_id: missingMapping.issue.id,
        anomaly_type: "sync_failure_chain",
        severity: "critical",
        details_json: { failures: 3 },
      },
    });
    assert.equal(secondCritical.status, 201);

    const resolved = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/anomalies/${secondCritical.body.data.id}/resolve`,
      token,
    });
    assert.equal(resolved.status, 200);
    assert.equal(resolved.body.data.status, "resolved");

    insertAttachment(config, project, missingMapping.issue, {
      original_filename: "pending-upload.png",
      download_status: "failed",
      sync_status: "pending",
      error_message: "download failed in verify",
    });
    const attachmentDryRun = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/issues/${missingMapping.issue.id}/dry-run/jira`,
      token,
    });
    assert.equal(attachmentDryRun.body.data.can_sync, true);
    assert.ok(
      !attachmentDryRun.body.data.warnings.some((warning) => warning.code.startsWith("ATTACHMENT_")),
      "Issue dry-run must not warn about attachment sync until attachment outbound is wired"
    );

    const listMappings = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/mapping-rules?approval_status=approved`,
      token,
    });
    assert.equal(listMappings.status, 200);
    assert.ok(listMappings.body.data.length >= 6);

    const mappingSettings = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/mapping-settings?source_system=backlog&target_system=jira`,
      token,
    });
    assert.equal(mappingSettings.status, 200);

    const otherProject = createProject(config, "OTHER");
    const otherRule = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${otherProject.id}/mapping-rules`,
      token,
      body: {
        mapping_type: "status",
        direction_from: "backlog",
        direction_to: "cis",
        from_value: "Other",
        to_value: "open",
      },
    });
    assert.equal(otherRule.status, 201);
    const isolatedMappings = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/mapping-rules`,
      token,
    });
    assert.equal(isolatedMappings.body.data.some((rule) => rule.id === otherRule.body.data.id), false);
    const beforeCrossProjectDb = createConnection({ config });
    const crossProjectCounts = {
      jobs: beforeCrossProjectDb.prepare("SELECT COUNT(*) AS total FROM sync_jobs").get().total,
      journal: beforeCrossProjectDb.prepare("SELECT COUNT(*) AS total FROM sync_journal").get().total,
    };
    beforeCrossProjectDb.close();
    const crossProjectUpdate = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/projects/${project.id}/mapping-rules/${otherRule.body.data.id}`,
      token,
      body: { to_value: "done" },
    });
    assert.equal(crossProjectUpdate.status, 404);
    assert.equal(crossProjectUpdate.body.error.code, "RESOURCE_NOT_FOUND");
    const afterCrossProjectDb = createConnection({ config });
    assert.equal(afterCrossProjectDb.prepare("SELECT to_value FROM mapping_rules WHERE id = ?").get(otherRule.body.data.id).to_value, "open");
    assert.equal(afterCrossProjectDb.prepare("SELECT COUNT(*) AS total FROM sync_jobs").get().total, crossProjectCounts.jobs);
    assert.equal(afterCrossProjectDb.prepare("SELECT COUNT(*) AS total FROM sync_journal").get().total, crossProjectCounts.journal);
    afterCrossProjectDb.close();
    const legacyMappings = await requestJson(server, { pathname: ["", "api", "v1", "mapping-rules"].join("/"), token });
    assert.equal(legacyMappings.status, 404);

    const otherAnomaly = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${otherProject.id}/anomalies`,
      token,
      body: { anomaly_type: "routing_mismatch", severity: "warning", details_json: { source: "other-project" } },
    });
    assert.equal(otherAnomaly.status, 201);
    const otherIssue = CisApi.createManualIssue({ config, input: { project_id: otherProject.id, summary: "Other anomaly issue" } }).issue;
    const anomalyCountBeforeDb = createConnection({ config });
    const anomalyCountBeforeCrossCreate = anomalyCountBeforeDb.prepare("SELECT COUNT(*) AS total FROM anomaly_log").get().total;
    anomalyCountBeforeDb.close();
    const crossIssueAnomaly = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/anomalies`,
      token,
      body: { issue_id: otherIssue.id, anomaly_type: "routing_mismatch", severity: "warning", details_json: {} },
    });
    assert.equal(crossIssueAnomaly.status, 404);
    assert.equal(crossIssueAnomaly.body.error.code, "RESOURCE_NOT_FOUND");
    const anomalyCountDb = createConnection({ config });
    assert.equal(anomalyCountDb.prepare("SELECT COUNT(*) AS total FROM anomaly_log").get().total, anomalyCountBeforeCrossCreate);
    anomalyCountDb.close();
    const isolatedAnomalies = await requestJson(server, { pathname: `/api/v1/projects/${project.id}/anomalies`, token });
    assert.equal(isolatedAnomalies.body.data.some((item) => item.id === otherAnomaly.body.data.id), false);
    const anomalyCountsDb = createConnection({ config });
    const anomalySideEffects = {
      jobs: anomalyCountsDb.prepare("SELECT COUNT(*) AS total FROM sync_jobs").get().total,
      journal: anomalyCountsDb.prepare("SELECT COUNT(*) AS total FROM sync_journal").get().total,
    };
    anomalyCountsDb.close();
    const crossProjectResolve = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/anomalies/${otherAnomaly.body.data.id}/resolve`,
      token,
    });
    assert.equal(crossProjectResolve.status, 404);
    assert.equal(crossProjectResolve.body.error.code, "RESOURCE_NOT_FOUND");
    const afterAnomalyDb = createConnection({ config });
    assert.equal(afterAnomalyDb.prepare("SELECT status FROM anomaly_log WHERE id = ?").get(otherAnomaly.body.data.id).status, "open");
    assert.equal(afterAnomalyDb.prepare("SELECT COUNT(*) AS total FROM sync_jobs").get().total, anomalySideEffects.jobs);
    assert.equal(afterAnomalyDb.prepare("SELECT COUNT(*) AS total FROM sync_journal").get().total, anomalySideEffects.journal);
    afterAnomalyDb.close();
    const legacyAnomalies = await requestJson(server, { pathname: ["", "api", "v1", "anomalies"].join("/"), token });
    assert.equal(legacyAnomalies.status, 404);
    assert.ok(
      mappingSettings.body.data.flows.systems_to_cis.some((row) =>
        row.mapping_type === "issue_type" && row.from_value === "Task"
      ),
      "Expected pulled Backlog issue type value in Systems -> CIS settings"
    );
    assert.ok(
      mappingSettings.body.data.flows.cis_to_system.some((row) =>
        row.mapping_type === "status" && row.from_value === "done"
      ),
      "Expected canonical CIS status value in CIS -> System settings"
    );
    const taskSystemSetting = mappingSettings.body.data.flows.systems_to_cis.find((row) =>
      row.mapping_type === "issue_type" && row.from_value === "Task"
    );
    assert.ok(taskSystemSetting.system_values.some((option) => option.value === "Bug"));
    assert.ok(taskSystemSetting.system_values.some((option) => option.value === "Task"));
    const doneTargetSetting = mappingSettings.body.data.flows.cis_to_system.find((row) =>
      row.mapping_type === "status" && row.from_value === "done"
    );
    assert.ok(doneTargetSetting.system_values.some((option) => option.value === "Done"));
    assert.ok(mappingSettings.body.data.flows.cis_to_system.some((row) =>
      row.mapping_type === "user" && row.from_value === "assignee@example.test"
    ));
    const userTargetSetting = mappingSettings.body.data.flows.cis_to_system.find((row) =>
      row.mapping_type === "user" && row.from_value === "assignee@example.test"
    );
    assert.ok(userTargetSetting.system_values.some((option) =>
      option.value === "jira-account-1" && option.label === "Jira Display User"
    ));

    const listAnomalyResponse = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/anomalies?issue_id=${missingMapping.issue.id}`,
      token,
    });
    assert.equal(listAnomalyResponse.status, 200);
    assert.ok(listAnomalyResponse.body.data.length >= 5);
  });
}

verifyPhase05()
  .then(() => {
    console.log("Mapping, anomaly and Jira dry-run verification passed.");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
