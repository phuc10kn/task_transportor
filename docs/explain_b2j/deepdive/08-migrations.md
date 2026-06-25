# Deepdive: `migrations/001_init.sql` — Database Schema

## Vai trò

Schema migration đầu tiên (và duy nhất hiện tại) tạo toàn bộ cấu trúc database cho state tracking.

## Schema

### `schema_migrations`

Migration tracking table.

```sql
CREATE TABLE schema_migrations (
    version     INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    applied_at  TEXT DEFAULT (datetime('now'))
);
```

Dùng để track migration nào đã chạy, tránh chạy lại.

### `projects`

Lưu thông tin project đã được config.

```sql
CREATE TABLE projects (
    id                       TEXT PRIMARY KEY,
    name                     TEXT NOT NULL,
    backlog_project_key      TEXT NOT NULL,
    backlog_issue_key_prefix TEXT NOT NULL,
    jira_project_key         TEXT NOT NULL,
    config_path              TEXT NOT NULL,
    updated_at               TEXT DEFAULT (datetime('now'))
);
```

| Column | Mô tả |
|--------|-------|
| `id` | Project ID slug (VD: `wecsy-main`) |
| `config_path` | Relative path đến file JSON config |
| `updated_at` | Tự động set khi tạo, cần update thủ công khi config thay đổi |

### `issue_mappings`

Track issue nào đã được tạo trên Jira.

```sql
CREATE TABLE issue_mappings (
    project_id          TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    backlog_issue_key   TEXT NOT NULL,
    jira_issue_key      TEXT NOT NULL,
    backlog_updated_at  TEXT,
    jira_updated_at     TEXT,
    last_synced_at      TEXT NOT NULL,
    source_hash         TEXT,
    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (project_id, backlog_issue_key)
);

CREATE INDEX idx_issue_mappings_jira_issue_key
    ON issue_mappings(jira_issue_key);
```

| Column | Mô tả |
|--------|-------|
| `jira_issue_key` | Jira issue key sau khi tạo |
| `backlog_updated_at` / `jira_updated_at` | Dùng để phát hiện thay đổi cần re-sync |
| `source_hash` | Hash của source issue để detect thay đổi |
| `last_synced_at` | Thời điểm sync gần nhất |

**Composite PK** `(project_id, backlog_issue_key)` đảm bảo mỗi Backlog issue chỉ được map một lần.

**Index** trên `jira_issue_key` cho phép query ngược (từ Jira về Backlog).

### `comment_mappings`

Track comment nào đã được đồng bộ.

```sql
CREATE TABLE comment_mappings (
    project_id          TEXT NOT NULL,
    backlog_issue_key   TEXT NOT NULL,
    backlog_comment_id  TEXT NOT NULL,
    jira_comment_id     TEXT,
    synced_at           TEXT NOT NULL,
    created_at          TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (project_id, backlog_issue_key, backlog_comment_id),
    FOREIGN KEY (project_id, backlog_issue_key)
        REFERENCES issue_mappings(project_id, backlog_issue_key)
        ON DELETE CASCADE
);

CREATE INDEX idx_comment_mappings_issue
    ON comment_mappings(project_id, backlog_issue_key);
```

| Column | Mô tả |
|--------|-------|
| `backlog_comment_id` | ID của comment trên Backlog |
| `jira_comment_id` | Nullable — có thể comment chưa được tạo trên Jira |
| `synced_at` | Thời điểm sync |

**Composite PK** 3 cột đảm bảo mỗi comment chỉ sync một lần.

**FK CASCADE**: Khi xóa issue mapping, tự động xóa comment mappings.

### `sync_events`

Audit log cho mọi hành động đồng bộ.

```sql
CREATE TABLE sync_events (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id        TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    backlog_issue_key TEXT,
    action            TEXT NOT NULL,
    status            TEXT NOT NULL,
    message           TEXT,
    created_at        TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sync_events_project_issue
    ON sync_events(project_id, backlog_issue_key, created_at);
```

| Column | Mô tả |
|--------|-------|
| `action` | `create_jira_issue`, `update_jira_issue`, `update_jira_comment`, v.v. |
| `status` | `success`, `failure`, `skipped` |
| `message` | Error message nếu failure, hoặc ghi chú |

**Index** cho phép query nhanh: "tìm tất cả events của project X, issue Y, sắp xếp theo thời gian".

## Pragmas

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
```

- **foreign_keys = ON**: Bật ràng buộc khóa ngoại (SQLite mặc định tắt)
- **journal_mode = WAL**: Write-Ahead Logging — tốt hơn cho concurrent reads, an toàn với crash

## Thiết kế

- **Cascading deletes**: Xóa project → tự động xóa issue_mappings, comment_mappings, sync_events
- **Composite keys**: Dùng natural keys thay vì auto-increment cho issue/comment mappings — tránh duplicate tự nhiên
- **Denormalized status tracking**: `backlog_updated_at` và `jira_updated_at` cho phép so sánh nhanh mà không cần join
- **Audit trail**: `sync_events` ghi lại mọi thứ — không implicit operation
