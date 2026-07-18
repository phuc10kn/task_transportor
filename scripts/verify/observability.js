const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { createApp } = require("../../src/app");
const { createServer: createAdminServer } = require("../../apps/admin-web/server");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { createHttpTransport } = require("../../src/infrastructure/external/transports/http/HttpTransport");
const { getLogger } = require("../../src/infrastructure/observability/logger");
const { withTraceContext } = require("../../src/infrastructure/observability/traceContext");
const SyncApi = require("../../src/modules/Sync/SyncApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const { createSyncJobRepository } = require("../../src/modules/Sync/infrastructure/SyncJobRepository");
const { makeTempConfig } = require("./helpers/tempConfig");
const { requestJson, withServer } = require("./helpers/http");

function recordsIn(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
}

function datedFile(root, ...parts) {
  const day = new Date().toISOString().slice(0, 10);
  return path.join(root, ...parts.map((part) => part.replace("{day}", day)));
}

function fakeResponse({ status = 200, contentType = "application/json", body = null, requestId = null }) {
  const raw = Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body), "utf8");
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get(name) {
        if (String(name).toLowerCase() === "content-type") return contentType;
        if (String(name).toLowerCase() === "x-request-id") return requestId;
        return null;
      },
    },
    async arrayBuffer() { return raw; },
  };
}

async function verifyHttpAndDurableJob(config) {
  await withServer(createApp({ config }), async (server) => {
    const response = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: { email: "missing@example.test", password: "plain-password-canary" },
    });
    assert.equal(response.status, 401);
    assert.ok(response.headers["x-correlation-id"]);
    assert.ok(response.headers["x-request-id"]);
  });

  const traceId = "trc_observability_contract";
  const correlationId = "cor_observability_contract";
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Observability Contract",
      sync_enabled: true,
      backlog_space_url: "https://observability.backlog.com",
      backlog_project_key: "OBS",
      backlog_issue_key_prefix: "OBS",
      backlog_api_key_env: "BACKLOG_API_KEY",
      jira_project_key: "OBS",
      jira_site_url: "https://observability.atlassian.net",
      jira_email_env: "JIRA_EMAIL",
      jira_api_token_env: "JIRA_API_TOKEN",
      translation_ai_provider: "deepseek",
      source_language: "ja",
      target_language: "vi",
    },
  });
  const enqueued = withTraceContext({ trace_id: traceId, correlation_id: correlationId }, () => SyncApi.enqueueJob({
    config,
    input: {
      project_id: project.id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "noop_test",
      payload_json: { contract: true },
      trigger: "manual",
    },
  }));
  const reloaded = createSyncJobRepository({ config }).findById(enqueued.id);
  assert.equal(reloaded.trace_id, traceId);
  assert.equal(reloaded.correlation_id, correlationId);
  const result = await SyncApi.runJobNow({ config, jobId: enqueued.id, workerId: "observability-contract" });
  assert.equal(result.job.status, "success");
}

async function verifyAdminProxy(config) {
  const adminLogger = getLogger(config, { service: "admin-web" });
  await withServer(createAdminServer({
    logger: adminLogger,
    fetchImpl: async () => { throw new Error("upstream unavailable"); },
  }), async (server) => {
    const response = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/proxy-contract",
      body: { password: "proxy-password-canary" },
    });
    assert.equal(response.status, 502);
    assert.equal(response.body.error.code, "API_PROXY_ERROR");
    assert.equal(response.body.error.correlation_id, response.headers["x-correlation-id"]);
  });
  await adminLogger.close();
}

async function verifyExternal(config) {
  const transport = createHttpTransport({
    fetchImpl: async (url) => {
      if (String(url).includes("network")) throw new Error("network canary");
      if (String(url).includes("binary")) {
        return fakeResponse({ contentType: "application/octet-stream", body: Buffer.from([0, 1, 2]) });
      }
      return fakeResponse({ body: { ok: true, access_token: "response-secret-canary" }, requestId: "provider-request-1" });
    },
  });

  for (const provider of ["backlog", "jira", "deepseek", "openai"]) {
    await transport.request({
      url: `https://provider.example/${provider}?apiKey=url-secret-canary`,
      method: "POST",
      body: JSON.stringify({ prompt: `request-${provider}`, api_key: "request-secret-canary" }),
      timeoutMs: 1000,
      observability: { config, provider, operation: "contract.test" },
    });
  }
  await transport.request({
    url: "https://provider.example/binary",
    timeoutMs: 1000,
    observability: { config, provider: "backlog", operation: "binary.test" },
  });
  await assert.rejects(() => transport.request({
    url: "https://provider.example/network",
    timeoutMs: 1000,
    observability: { config, provider: "jira", operation: "network.test" },
  }), (error) => error.code === "EXTERNAL_HTTP_NETWORK");
}

async function verifyRetention() {
  const config = makeTempConfig("observability-retention", { LOG_LEVEL: "info", LOG_RETENTION_DAYS: "7" });
  const oldFile = path.join(config.storage.logs, "external", "jira", "jira-2000-01-01.ndjson");
  const unrelated = path.join(config.storage.logs, "external", "jira", "keep.txt");
  fs.mkdirSync(path.dirname(oldFile), { recursive: true });
  fs.writeFileSync(oldFile, "{}\n");
  fs.writeFileSync(unrelated, "keep");
  const oldTime = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  fs.utimesSync(oldFile, oldTime, oldTime);
  const logger = getLogger(config);
  logger.info({ event: "retention.contract" });
  await logger.close();
  assert.equal(fs.existsSync(oldFile), false);
  assert.equal(fs.existsSync(unrelated), true);
}

async function main() {
  const config = makeTempConfig("observability", { LOG_LEVEL: "info", LOG_RETENTION_DAYS: "7" });
  ensureStorage(config.storage);
  migrate({ config });

  await verifyHttpAndDurableJob(config);
  await verifyAdminProxy(config);
  await verifyExternal(config);
  await verifyRetention();
  const logger = getLogger(config);
  logger.flush();
  await logger.close();

  const appFile = datedFile(config.storage.logs, "app", "cis-api-{day}.ndjson");
  const appRecords = recordsIn(appFile);
  for (const event of ["request.start", "request.body", "request.end", "job.enqueued", "job.start", "job.end"]) {
    assert.ok(appRecords.some((record) => record.event === event), `Missing app event ${event}`);
  }
  const bodyRecord = appRecords.find((record) => record.event === "request.body");
  assert.equal(bodyRecord.body.password, "[REDACTED]");
  const jobEvents = appRecords.filter((record) => record.job_id && record.trace_id === "trc_observability_contract");
  assert.ok(jobEvents.some((record) => record.event === "job.enqueued"));
  assert.ok(jobEvents.some((record) => record.event === "job.start"));
  assert.ok(jobEvents.some((record) => record.event === "job.end"));
  const proxyRecords = recordsIn(datedFile(config.storage.logs, "app", "admin-web-{day}.ndjson"));
  assert.ok(proxyRecords.some((record) => record.event === "proxy.start"));
  assert.equal(proxyRecords.find((record) => record.event === "proxy.error").body.password, "[REDACTED]");

  for (const provider of ["backlog", "jira", "deepseek", "openai"]) {
    const file = datedFile(config.storage.logs, "external", provider, `${provider}-{day}.ndjson`);
    const records = recordsIn(file);
    const request = records.find((record) => record.operation === "contract.test" && record.event === "request");
    const response = records.find((record) => record.external_request_id === request.external_request_id && record.event === "response");
    assert.ok(request && response, `Missing ${provider} request/response pair`);
    assert.equal(request.body.api_key, "[REDACTED]");
    assert.equal(response.body.access_token, "[REDACTED]");
    assert.equal(response.provider_request_id, "provider-request-1");
  }

  const backlogRecords = recordsIn(datedFile(config.storage.logs, "external", "backlog", "backlog-{day}.ndjson"));
  assert.equal(backlogRecords.find((record) => record.operation === "binary.test" && record.event === "response").binary_omitted, true);
  const jiraRecords = recordsIn(datedFile(config.storage.logs, "external", "jira", "jira-{day}.ndjson"));
  assert.ok(jiraRecords.some((record) => record.operation === "network.test" && record.event === "request"));
  assert.ok(jiraRecords.some((record) => record.event === "error" && record.error.code === "EXTERNAL_HTTP_NETWORK"));

  const allLogs = fs.readdirSync(config.storage.logs, { recursive: true, encoding: "utf8" })
    .filter((entry) => String(entry).endsWith(".ndjson"))
    .map((entry) => fs.readFileSync(path.join(config.storage.logs, entry), "utf8"))
    .join("\n");
  for (const secret of ["plain-password-canary", "proxy-password-canary", "url-secret-canary", "request-secret-canary", "response-secret-canary"]) {
    assert.ok(!allLogs.includes(secret), `Secret leaked into logs: ${secret}`);
  }

  console.log("Observability verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
