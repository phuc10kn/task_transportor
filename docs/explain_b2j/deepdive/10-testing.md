# Deepdive: Testing

## Vai trò

Test suite dùng **Node `--test` runner** (built-in từ Node 18+, ổn định từ Node 20) — không cần Jest, Vitest, hay bất kỳ test framework nào khác.

## Test files

```
test/
├── guardrails.test.js    # 6 tests: guardrails + mapper + config
└── state-db.test.js      # 1 integration test: state DB full flow
```

Chạy với:

```
node --test
```

## `guardrails.test.js` — 6 tests

### Test 1: Valid issue maps correctly
- Load config `projects/example.json`
- Load issue từ biến inline (backlog issue hợp lệ)
- Gọi `mapBacklogIssueToJira()`
- Assert:
  - `result.ok === true`
  - `result.payload.project_key === "EXJ"`
  - `result.payload.summary` bắt đầu bằng `[EXAMPLE-123]`
  - `result.payload.metadata.mapped_jira_status === "To Do"`

### Test 2: Rejects wrong Backlog project
- Tạo issue với `projectKey: "WRONG"` và `issueKey: "WRONG-1"`
- Gọi mapper
- Assert:
  - `result.ok === false`
  - errors chứa lỗi issueKey hoặc projectKey

### Test 3: Rejects missing status mapping
- Tạo issue với status `"Unknown"`
- Gọi `validateBacklogIssueForProject()`
- Assert errors chứa `"No status mapping for 'Unknown'"`

### Test 4: Create mode validation
- Test 3 cases:
  - `allowCreate: false` → errors chứa "Dry-run only mode"
  - `confirmJiraProject: "WRONG"` → errors chứa "Jira project mismatch"
  - Đúng cả hai → errors empty

### Test 5: Instruction file paths resolved correctly
- `resolveInstructionFiles(["project-instructions/example.md"], repoRoot)`
- Assert kết quả là absolute path chứa `project-instructions/example.md`

### Test 6: Rejects escape paths
- `resolveInstructionFiles(["../../etc/passwd"], repoRoot)`
- Assert throw với "escapes the repo root"

## `state-db.test.js` — Integration test

Full flow integration test:

```
1. Tạo temp directory
2. initStateDb(tempPath) → tạo DB + schema
3. Ghi file config tạm vào temp dir
4. upsertProjectFromConfig({ dbPath, projectPath })
5. listProjects(dbPath) → assert 1 project, id === "test-project"

6. upsertIssueMapping({ projectId, backlogIssueKey, jiraIssueKey })
7. getIssueMapping({ projectId, backlogIssueKey })
   → assert mapping found, jiraIssueKey khớp

8. Ghi file comments JSON tạm (2 comments: 1001, 1002)
9. markCommentSynced({ backlogCommentId: "1001" })
10. findUnsyncedBacklogComments({ commentsJsonPath })
    → assert chỉ comment 1002 là unsynced
```

## Test helpers

- **`setup()`** (guardrails.test.js): Load config một lần, dùng lại cho nhiều tests
- **Temp directory** (state-db.test.js): Tạo temp dir cho mỗi test run, tránh ảnh hưởng state thật

## Cách chạy

```bash
# Chạy tất cả tests
node --test

# Chạy specific test file
node --test test/guardrails.test.js

# Watch mode (Node 22+)
node --test --watch
```

## Thiết kế

- **Không mock**: Test dùng thật file system và sqlite3 — integration-style
- **Temp isolation**: state-db test dùng temp dir, không ảnh hưởng state thật
- **Minimal setup**: Không test runner config, không transform, không setup file
- **Node built-in**: `import { describe, it } from 'node:test'`, `import assert from 'node:assert'`
