const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { createApp } = require("../../src/app");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

function issue(index, created) {
  return {
    id: 9000 + index,
    issueKey: `BATCH-${index}`,
    projectKey: "BATCH",
    summary: `Batch issue ${index}`,
    description: `Filtered manual pull fixture ${index}.`,
    issueType: { id: 1, name: "Task" },
    status: { id: 1, name: "Open" },
    priority: { id: 3, name: "Normal" },
    created: `${created}T01:00:00Z`,
    updated: `${created}T02:00:00Z`,
  };
}

function writeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "task-transportor-filtered-pull-fixture-"));
  const fixturePath = path.join(root, "backlog.json");
  const groups = [
    [1, "2026-07-01"],
    [99, "2026-07-02"],
    [1, "2026-07-03"],
    [149, "2026-07-04"],
    [2693, "2026-07-05"],
  ];
  const issues = [];
  let index = 1;
  for (const [count, created] of groups) {
    for (let offset = 0; offset < count; offset += 1) issues.push(issue(index++, created));
  }
  fs.writeFileSync(fixturePath, JSON.stringify({ projectId: 77, projectKey: "BATCH", issues }), "utf8");
  return fixturePath;
}

async function main() {
  const config = makeTempConfig("backlog-filtered-manual-pull", {
    ADMIN_EMAIL: "filtered-pull@example.test",
    ADMIN_PASSWORD: "verify-password",
    BACKLOG_FAKE_FIXTURE_PATH: writeFixture(),
    WORKER_ENABLED: "true",
  });
  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({ config, email: "filtered-pull@example.test", password: "verify-password" });
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Filtered manual pull",
      enabled: true,
      sync_enabled: true,
      manual_pull_enabled: true,
      backlog_space_url: "https://example.backlog.com",
      backlog_project_key: "BATCH",
      backlog_issue_key_prefix: "BATCH",
      backlog_api_key_env: "BACKLOG_API_KEY_BATCH",
      backlog_mapping_values_json: {
        status_directory: [{ id: 1, name: "Open", display_order: 1 }],
        user_directory: [],
      },
    },
  });

  await withServer(createApp({ config }), async (server) => {
    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: { email: "filtered-pull@example.test", password: "verify-password" },
    });
    const call = (options) => requestJson(server, { token: login.body.data.token, ...options });
    const count = (createdTo) => call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/manual-pulls/count`,
      body: { created_from: "2026-07-01", created_to: createdTo, status_ids: [1], assignee_ids: [], not_closed: false },
    });

    const empty = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/manual-pulls/count`,
      body: { created_from: "2026-06-01", created_to: "2026-06-30", status_ids: [], assignee_ids: [], not_closed: false },
    });
    assert.deepEqual(empty.body.data, { source_count: 0, page_size: 100, total_pages: 0 });
    assert.deepEqual((await count("2026-07-01")).body.data, { source_count: 1, page_size: 100, total_pages: 1 });
    assert.deepEqual((await count("2026-07-02")).body.data, { source_count: 100, page_size: 100, total_pages: 1 });
    assert.deepEqual((await count("2026-07-03")).body.data, { source_count: 101, page_size: 100, total_pages: 2 });
    assert.deepEqual((await count("2026-07-05")).body.data, { source_count: 2943, page_size: 100, total_pages: 30 });

    const pageBody = { created_from: "2026-07-01", created_to: "2026-07-04", status_ids: [1], assignee_ids: [], not_closed: false };
    const enqueuePage = (page) => call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/backlog/manual-pulls/pages/${page}`,
      body: pageBody,
    });
    assert.deepEqual((await enqueuePage(1)).body.data, { page: 1, source_rows: 100, newly_queued: 100, reused_active: 0, already_in_cis: 0, invalid_rows: 0 });
    assert.deepEqual((await enqueuePage(2)).body.data, { page: 2, source_rows: 100, newly_queued: 100, reused_active: 0, already_in_cis: 0, invalid_rows: 0 });
    assert.deepEqual((await enqueuePage(3)).body.data, { page: 3, source_rows: 50, newly_queued: 50, reused_active: 0, already_in_cis: 0, invalid_rows: 0 });
    assert.deepEqual((await enqueuePage(4)).body.data, { page: 4, source_rows: 0, newly_queued: 0, reused_active: 0, already_in_cis: 0, invalid_rows: 0 });
    assert.deepEqual((await enqueuePage(1)).body.data, { page: 1, source_rows: 100, newly_queued: 0, reused_active: 100, already_in_cis: 0, invalid_rows: 0 });

    const jobs = SyncApi.listJobs({ config, filters: { project_id: project.id } });
    assert.equal(jobs.length, 250);
    assert.equal(jobs.every((job) => job.job_type === "manual_pull"), true);
    assert.equal(jobs.every((job) => job.payload_json.mode === "filtered_pull" && job.payload_json.backlog_issue_snapshot), true);

    const injected = await call({
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/sync-jobs`,
      body: { payload_json: { backlog_issue_snapshot: { version: 1 } } },
    });
    assert.equal(injected.status, 422);
    assert.equal(injected.body.error.code, "SYNC_JOB_PAYLOAD_RESERVED");

    const snapshotJob = SyncApi.enqueueJob({
      config,
      input: {
        project_id: project.id,
        direction_from: "backlog",
        direction_to: "cis",
        job_type: "manual_pull",
        payload_json: {
          backlog_issue_key: "BATCH-SNAPSHOT",
          backlog_issue_snapshot: {
            version: 1,
            issueKey: "BATCH-SNAPSHOT",
            projectId: 77,
            projectKey: "BATCH",
            summary: "Snapshot-only issue",
            description: "The fixture has no issue with this key.",
            issueType: { id: 1, name: "Task" },
            status: { id: 1, name: "Open" },
            priority: { id: 3, name: "Normal" },
            assignee: null,
            created: "2026-07-06T01:00:00Z",
            updated: "2026-07-06T02:00:00Z",
          },
          with_translation: false,
          push_to_jira: false,
        },
        trigger: "manual",
      },
    });
    const snapshotRun = await SyncApi.runJobNow({ config, jobId: snapshotJob.id, workerId: "filtered-pull-snapshot" });
    assert.equal(snapshotRun.job.status, "success", "snapshot job must not call Backlog getIssue");
    assert.ok(CisApi.getIssueByBacklogKey({ config, projectId: project.id, backlogIssueKey: "BATCH-SNAPSHOT" }));

    ProjectsApi.updateProject({ config, projectId: project.id, input: { backlog_external_read_enabled: false } });
    const jobsBeforeReadGate = SyncApi.listJobs({ config, filters: { project_id: project.id } }).length;
    const blockedRead = await count("2026-07-04");
    assert.equal(blockedRead.status, 422);
    assert.equal(blockedRead.body.error.code, "BACKLOG_EXTERNAL_READ_DISABLED");
    assert.equal(SyncApi.listJobs({ config, filters: { project_id: project.id } }).length, jobsBeforeReadGate);
    ProjectsApi.updateProject({ config, projectId: project.id, input: { backlog_external_read_enabled: true } });

    config.worker.enabled = false;
    const jobsBeforeBlockedPage = SyncApi.listJobs({ config, filters: { project_id: project.id } }).length;
    const blocked = await enqueuePage(1);
    assert.equal(blocked.status, 503);
    assert.equal(blocked.body.error.code, "SYNC_WORKER_UNAVAILABLE");
    assert.equal(SyncApi.listJobs({ config, filters: { project_id: project.id } }).length, jobsBeforeBlockedPage);
  });

  console.log("Backlog filtered manual pull verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
