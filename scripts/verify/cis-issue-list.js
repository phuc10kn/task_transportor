const assert = require("assert");

const { createApp } = require("../../src/app");
const { createConnection } = require("../../src/infrastructure/database/connection");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const { requestJson, withServer } = require("./helpers/http");
const { makeTempConfig } = require("./helpers/tempConfig");

async function main() {
  const config = makeTempConfig("cis-issue-list", {
    ADMIN_EMAIL: "cis-list@example.test",
    ADMIN_PASSWORD: "verify-password",
  });
  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({ config, email: "cis-list@example.test", password: "verify-password" });
  const project = ProjectsApi.createProject({ config, input: { name: "Project 1", enabled: true, sync_enabled: true } });
  assert.equal(project.id, 1);

  let target;
  for (let index = 1; index <= 25; index += 1) {
    const created = CisApi.createManualIssue({
      config,
      input: {
        project_id: 1,
        summary: index === 3 ? "Mục đích sửa đổi" : `Issue ${String(index).padStart(2, "0")}`,
        priority: index === 3 ? "High" : "Normal",
        assignee: index === 3 ? "Nguyen An" : "Unassigned",
      },
    }).issue;
    if (index === 3) target = created;
  }
  CisApi.markIssueSyncStatus({ config, issueId: target.id, status: "pending_review" });
  const db = createConnection({ config });
  const stored = db.prepare("SELECT fields_json FROM issues WHERE id = ?").get(target.id);
  const fields = JSON.parse(stored.fields_json);
  fields.priority = { backlog: "High", cis: "CIS Medium" };
  fields.assignee = { backlog: "Backlog Owner", cis: "CIS Owner" };
  db.prepare("UPDATE issues SET backlog_issue_key = '18DMP-3', fields_json = ? WHERE id = ?")
    .run(JSON.stringify(fields), target.id);
  db.close();

  await withServer(createApp({ config }), async (server) => {
    const login = await requestJson(server, { method: "POST", pathname: "/api/v1/auth/login", body: { email: "cis-list@example.test", password: "verify-password" } });
    const call = (pathname) => requestJson(server, { pathname, token: login.body.data.token });

    const first = await call("/api/v1/projects/1/issues");
    assert.equal(first.status, 200);
    assert.equal(first.body.data.items.length, 20);
    assert.deepEqual(first.body.data.pagination, { page: 1, page_size: 20, total: 25, total_pages: 2 });
    assert.equal((await call("/api/v1/projects/1/issues?page=2")).body.data.items.length, 5);

    assert.equal((await call("/api/v1/projects/1/issues?q=18DMP-3")).body.data.items.length, 0);
    const summarySearch = await call("/api/v1/projects/1/issues?q=m%E1%BB%A5c");
    assert.deepEqual(summarySearch.body.data.items.map((issue) => issue.id), [target.id]);
    assert.equal(summarySearch.body.data.items[0].current_priority, "CIS Medium");
    assert.equal(summarySearch.body.data.items[0].current_assignee, "CIS Owner");
    assert.equal((await call("/api/v1/projects/1/issues?page=0")).status, 422);
  });

  console.log("CIS issue pagination and Summary search passed for project_id=1.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
