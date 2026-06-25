# backlog2jira — Breakdown

## Cấu trúc thư mục

```
backlog2jira/
├── src/                    # Mã nguồn chính (ESM, Node >=20)
│   ├── cli.js              # Entry point CLI
│   ├── config.js           # Config loading & validation
│   ├── guardrails.js       # Safety validation
│   ├── mapper.js           # Backlog → Jira mapping
│   ├── sqlite.js           # SQLite CLI wrapper
│   ├── state-db.js         # State DB operations
│   └── state-cli.js        # State DB CLI
├── test/                   # Tests (Node --test runner)
│   ├── guardrails.test.js  # Guardrails + mapper + config tests
│   └── state-db.test.js    # State DB integration test
├── projects/               # Project config files
│   ├── example.json        # Example project
│   └── wecsy-main.json     # Real Wecsy project
├── project-instructions/   # Per-project AI instructions
│   ├── example.md
│   └── wecsy-main.md
├── examples/               # Sample payloads
│   ├── backlog-issue.example.json
│   └── backlog-comments.example.json
├── schemas/                # JSON Schema
│   └── project-config.schema.json
├── migrations/             # SQLite schema migrations
│   └── 001_init.sql
├── prompts/                # Prompt contracts cho AI agent
│   └── automation-sync.md
├── skills/                 # Reusable AI skill files
│   └── backlog-to-jira-mapping/
│       └── SKILL.md
├── docs/                   # Tài liệu
│   ├── state-db.md
│   ├── shared-accounts.md
│   ├── setup-workflow.md
│   ├── project-setup-form.md
│   └── examples/
│       └── wecsy-multi-repo.md
├── scripts/
│   └── README.md           # Script safety model
├── state/                  # Runtime SQLite DB (gitignored)
├── package.json
├── AGENTS.md
└── README.md
```

## Luồng dữ liệu chính

### 1. Load config
```
User/Codex
    │
    ▼  --project projects/wecsy-main.json
src/cli.js ──► src/config.js
                   ├── readJsonFile()          # Đọc JSON từ disk
                   ├── validateProjectConfig() # Validate cấu trúc + cross-field rules
                   └── resolveInstructionFiles() # Resolve đường dẫn instruction files
```

### 2. Validate & Map issue
```
    │
    ▼  --backlog-json backlog-issue.json
src/mapper.js
    ├── src/guardrails.js::validateBacklogIssueForProject()
    │   ├── Kiểm tra issueKey prefix có đúng không
    │   ├── Kiểm tra projectKey có khớp không
    │   ├── Kiểm tra issueType có trong allowed list không
    │   ├── Kiểm tra issueType có mapping không
    │   ├── Kiểm tra status có mapping không
    │   └── Kiểm tra priority (nếu có) có mapping không
    │
    └── Build Jira payload:
        ├── project_key: "WEC1"
        ├── issue_type: "Task"
        ├── summary: "[ONE_KYORITSU-123] ..."
        ├── description: "Backlog issue: ...\n...\n\nOriginal description:\n..."
        ├── labels: ["backlog-migrated", "one-kyoritsu", "wecsy"]
        ├── priority: "Medium"
        └── metadata: { backlog_issue_key, mapped_jira_status, ... }
```

### 3. Create guard
```
    │
    ▼
src/guardrails.js::validateCreateIntent()
    ├── allowCreate == false?     → dry-run mode
    ├── confirmJiraProject != jira.projectKey? → mismatch error
    └── Cả hai đều OK?           → create-ready mode
    │
    ▼
Output JSON: { mode: "dry-run" | "create-ready", jiraPayload, ... }
```

### 4. State management
```
src/state-cli.js
    │
    ▼
src/state-db.js
    ├── initStateDb()              # Chạy migration tạo tables
    ├── upsertProjectFromConfig()  # Lưu project vào DB
    ├── upsertIssueMapping()       # Ghi nhận issue đã tạo
    ├── getIssueMapping()          # Kiểm tra issue đã sync chưa
    ├── findUnsyncedBacklogComments() # Diff comments chưa sync
    ├── markCommentSynced()        # Đánh dấu comment đã sync
    └── addSyncEvent()             # Ghi audit log
    │
    ▼
src/sqlite.js (fork sqlite3 CLI subprocess)
    │
    ▼
state/backlog2jira.sqlite
```

## Database schema (4 tables)

| Table | Mục đích | PK |
|-------|----------|----|
| `projects` | Danh sách project đã config | `id` |
| `issue_mappings` | Issue đã tạo trên Jira | `(project_id, backlog_issue_key)` |
| `comment_mappings` | Comment đã sync | `(project_id, backlog_issue_key, backlog_comment_id)` |
| `sync_events` | Audit log mọi hành động | `id` (auto-increment) |

## Config validation rules

- Tất cả required fields phải có
- `sourceRoots`, `wikiRoots` phải là non-empty arrays
- `backlog.issueKeyPrefix` phải bắt đầu bằng `backlog.projectKey-`
- Mọi Backlog issue type trong `allowedIssueTypes` phải có mapping trong `mapping.issueType`
- Mọi Jira type được map đến phải nằm trong `jira.allowedIssueTypes`
- `rules.maxSummaryLength` phải là integer >= 50

## Project config example

```json
{
  "id": "example",
  "name": "Example Project",
  "backlog": {
    "projectKey": "EXAMPLE",
    "issueKeyPrefix": "EXAMPLE-",
    "allowedIssueTypes": ["Task", "Bug", "Story"]
  },
  "jira": {
    "projectKey": "EXJ",
    "defaultIssueType": "Task",
    "allowedIssueTypes": ["Task", "Bug", "Story"]
  },
  "mapping": {
    "issueType": { "Task": "Task", "Bug": "Bug", "Story": "Story" },
    "status": { "Open": "To Do", "In Progress": "In Progress", "Resolved": "Done", "Closed": "Done" },
    "priority": { "High": "High", "Normal": "Medium", "Low": "Low" }
  },
  "rules": {
    "requireBacklogKeyInSummary": true,
    "requireBacklogUrlInDescription": true,
    "maxSummaryLength": 255
  }
}
```

## Testing approach

Sử dụng **Node `--test` runner** (built-in, không cần Jest/Vitest):

- **guardrails.test.js** (6 tests): Valid issue mapping, reject wrong project, reject missing status mapping, create mode validation, instruction file paths, reject escape paths
- **state-db.test.js** (1 integration test): Full flow — init DB, upsert project, upsert issue mapping, mark comment synced, find unsynced comments

## Zero dependencies

`package.json` chỉ có `"type": "module"`, không có `dependencies` hay `devDependencies`. Mọi thứ đều dùng Node.js built-in modules:
- `fs/promises`, `path` — file operations
- `child_process.execFileSync` — gọi sqlite3 CLI
- `process.argv`, `process.stdout` — CLI I/O
- `node:test`, `node:assert` — testing
- `node:crypto` — hashing
