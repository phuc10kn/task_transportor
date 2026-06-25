# Deepdive: `src/state-db.js` — State Database Operations

## Vai trò

Module cao nhất trong stack database. Cung cấp CRUD operations và business logic cho state management — tracking project configs, issue mappings, comment syncs, và audit events.

## Public API

### Initialization

| Function | Description |
|----------|-------------|
| `initStateDb(dbPath?)` | Run migration file `001_init.sql` để tạo schema. Mặc định `state/backlog2jira.sqlite` |

### Projects

| Function | Description |
|----------|-------------|
| `upsertProjectFromConfig({dbPath?, projectPath})` | Load project config → INSERT OR REPLACE vào `projects` table |
| `listProjects(dbPath?)` | SELECT all projects → return array |

### Issue mappings

| Function | Description |
|----------|-------------|
| `upsertIssueMapping({dbPath?, projectId, backlogIssueKey, jiraIssueKey, backlogUpdatedAt?, jiraUpdatedAt?, sourceHash?, lastSyncedAt?})` | INSERT OR REPLACE issue mapping |
| `getIssueMapping({dbPath?, projectId, backlogIssueKey})` | SELECT một mapping, hoặc null |
| `listIssueMappings({dbPath?, projectId?})` | SELECT mappings, optionally filter by project |

### Comment syncs

| Function | Description |
|----------|-------------|
| `markCommentSynced({dbPath?, projectId, backlogIssueKey, backlogCommentId, jiraCommentId?, syncedAt?})` | INSERT OR REPLACE comment mapping |
| `listCommentMappings({dbPath?, projectId?, backlogIssueKey?})` | SELECT comment mappings với optional filters |
| `findUnsyncedBacklogComments({dbPath?, projectId, backlogIssueKey, commentsJsonPath})` | **Diff logic**: đọc comments JSON từ file → so với state DB → trả về comments chưa sync |

### Sync events (audit log)

| Function | Description |
|----------|-------------|
| `addSyncEvent({dbPath?, projectId, backlogIssueKey?, action, status, message?})` | INSERT event vào sync_events |
| `listSyncEvents({dbPath?, projectId?, backlogIssueKey?, limit?})` | SELECT events (mặc định limit 50) |

## Chi tiết: `findUnsyncedBacklogComments()`

Đây là function phức tạp nhất, thực hiện **diff logic**:

```
1. Đọc file JSON chứa tất cả comments từ Backlog API
2. Query state DB: SELECT * FROM comment_mappings 
   WHERE project_id = ? AND backlog_issue_key = ?
3. Filter: chỉ giữ comments chưa có trong state DB
4. Trả về array comments chưa sync (có thể empty)
```

Dùng để trả lời câu hỏi: *"Comment nào trên Backlog chưa được đồng bộ sang Jira?"*

## Default DB path

```js
const defaultDbPath = "state/backlog2jira.sqlite"
```

Có thể override bằng param `dbPath` ở mọi function.

## Internal helper

```js
function nowIso() {
    return new Date().toISOString()  // "2026-06-23T10:30:00.000Z"
}
```

## Usage pattern

```js
// Init
await initStateDb()

// Register project
upsertProjectFromConfig({ projectPath: "projects/wecsy-main.json" })

// Check if issue already synced
const existing = getIssueMapping({
    projectId: "wecsy-main",
    backlogIssueKey: "ONE_KYORITSU-456"
})

if (!existing) {
    // Create on Jira, then record
    upsertIssueMapping({
        projectId: "wecsy-main",
        backlogIssueKey: "ONE_KYORITSU-456",
        jiraIssueKey: "WEC1-789"
    })
}

// Find unsynced comments
const unsynced = findUnsyncedBacklogComments({
    projectId: "wecsy-main",
    backlogIssueKey: "ONE_KYORITSU-456",
    commentsJsonPath: "examples/backlog-comments.example.json"
})

// Log everything
addSyncEvent({
    projectId: "wecsy-main",
    backlogIssueKey: "ONE_KYORITSU-456",
    action: "create_jira_issue",
    status: "success"
})
```
