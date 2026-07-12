const CisApi = require("../../../src/modules/Cis/CisApi");
const { loadConfig } = require("../../../src/config/env");

const projectId = Number(process.argv[2]);
const key = process.argv[3];
CisApi.upsertBacklogIssue({
  config: loadConfig(),
  input: {
    project_id: projectId,
    backlog_issue_key: key,
    summary: "Concurrent issue",
    description: "Concurrent upsert",
    issue_type: "Task",
    priority: "Normal",
    assignee: null,
    fields_json: { summary: { backlog: "Concurrent issue" } },
    comments: [],
    attachments: [],
    payload_hash: "concurrent-hash",
  },
});
