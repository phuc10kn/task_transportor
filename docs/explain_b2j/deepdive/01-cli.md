# Deepdive: `src/cli.js` — CLI Entry Point

## Vai trò

`cli.js` là entry point của toàn bộ tool. Nó orchestrate luồng: parse args → load config → map issue → validate create intent → output JSON.

## Arguments

| Flag | Type | Required | Mô tả |
|------|------|----------|-------|
| `--project` | string | Yes | Path đến project config JSON |
| `--backlog-json` | string | Yes | Path đến Backlog issue JSON |
| `--help` | boolean | No | In help text và thoát |
| `--allow-create` | boolean | No | Bật chế độ tạo issue thật trên Jira |
| `--confirm-jira-project` | string | No | Xác nhận Jira project key (safety) |

## Execution flow

```
1. Parse process.argv
   ├── --help? → printHelp() + exit(0)
   └── Thiếu --project hoặc --backlog-json? → throw error

2. loadProjectConfig(projectPath)
   └── config.js::loadProjectConfig()
       ├── readJsonFile() 
       ├── validateProjectConfig()
       └── resolveInstructionFiles()

3. readJsonFile(backlogJsonPath)
   └── JSON.parse() file, trả về issue object

4. mapBacklogIssueToJira(issue, project)
   └── mapper.js::mapBacklogIssueToJira()
       ├── guardrails.js::validateBacklogIssueForProject()
       └── build Jira payload

5. Nếu mapper trả về errors[]
   └── guardrails.js::assertNoGuardrailErrors(errors) → throw

6. validateCreateIntent({ project, allowCreate, confirmJiraProject })
   └── Kiểm tra có được phép tạo không

7. Output JSON với:
   ├── mode: "dry-run" | "create-ready"
   ├── project: project info
   ├── createGuard: kết quả validateCreateIntent
   ├── jiraPayload: payload đã map
   └── nextMcpTool: gợi ý tool tiếp theo cho AI agent
```

## Output JSON structure

**Dry-run mode:**
```json
{
  "mode": "dry-run",
  "project": { "id": "example", "name": "Example Project" },
  "createGuard": { "ok": false, "errors": ["..."] },
  "jiraPayload": { ... },
  "nextMcpTool": null
}
```

**Create-ready mode:**
```json
{
  "mode": "create-ready",
  "project": { "id": "example", "name": "Example Project" },
  "createGuard": { "ok": true, "errors": [] },
  "jiraPayload": { ... },
  "nextMcpTool": "create_jira_issue"
}
```

## Thiết kế

- **Dry-run mặc định**: Ngay cả khi có `--allow-create`, nếu thiếu `--confirm-jira-project` hoặc sai project key, output vẫn là dry-run
- **JSON-only output**: Mọi output đều là JSON để AI agent dễ dàng parse và xử lý
- **Throw on error**: Nếu guardrails fail, CLI throw — không silently fail
- **Zero validation ở CLI layer**: Mọi validation đều delegate xuống config.js và guardrails.js
