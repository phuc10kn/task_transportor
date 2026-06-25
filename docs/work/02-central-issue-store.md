# Central Issue Store (CIS) — Schema

## Nguyên tắc thiết kế

- **Content immutable**: Khi Backlog issue được fetch lần đầu, `original_content` giữ nguyên mãi mãi. Mọi thay đổi sau đó là các revision riêng.
- **Tách bạch content và metadata**: Content (summary, description, comments) độc lập với metadata (status, priority, assignee) — vì nguồn cập nhật khác nhau.
- **CIS không phải database quan hệ đầy đủ**: Dùng document store (JSONB/JSON columns) cho linh hoạt, không cần migration mỗi lần thêm field mapping mới.

---

## 1. `projects` — Kế thừa từ thiết kế cũ

Giữ nguyên từ `backlog2jira` với bổ sung:

```sql
CREATE TABLE projects (
    id                       TEXT PRIMARY KEY,          -- 'wecsy-main'
    name                     TEXT NOT NULL,
    
    -- Backlog side
    backlog_project_key      TEXT NOT NULL,             -- 'ONE_KYORITSU'
    backlog_issue_key_prefix TEXT NOT NULL,             -- 'ONE_KYORITSU-'
    backlog_space_key        TEXT,                      -- 'cdrive'
    backlog_webhook_secret   TEXT,                      -- để verify webhook
    
    -- Jira side
    jira_project_key         TEXT NOT NULL,             -- 'WEC1'
    jira_webhook_secret      TEXT,                      -- để verify webhook
    
    -- Source context (cho AI)
    source_roots             TEXT NOT NULL DEFAULT '[]', -- JSON array
    wiki_roots               TEXT NOT NULL DEFAULT '[]', -- JSON array
    instruction_files        TEXT NOT NULL DEFAULT '[]', -- JSON array
    
    -- Sync config
    sync_enabled             INTEGER NOT NULL DEFAULT 1,
    auto_translate           INTEGER NOT NULL DEFAULT 1, -- AI tự động dịch?
    sync_direction           TEXT NOT NULL DEFAULT 'backlog_to_jira',  -- backlog_to_jira | bidirectional | disabled
    
    config_path              TEXT,
    updated_at               TEXT DEFAULT (datetime('now'))
);
```

---

## 2. `issues` — Core

```sql
CREATE TABLE issues (
    id                TEXT PRIMARY KEY,              -- UUID (không dùng key từ B/J)
    project_id        TEXT NOT NULL REFERENCES projects(id),
    
    -- Identifiers từ 2 hệ thống
    backlog_issue_key TEXT,                          -- 'ONE_KYORITSU-123', NULL nếu tạo từ Jira
    jira_issue_key    TEXT,                          -- 'WEC1-789', NULL nếu chưa sync
    
    -- Nguồn gốc
    source            TEXT NOT NULL CHECK(source IN ('backlog', 'jira', 'manual')),
    
    -- Vòng đời trong CIS
    status            TEXT NOT NULL DEFAULT 'ingested'
                      CHECK(status IN (
                          'ingested',           -- Vừa vào CIS, chưa xử lý
                          'pending_translate',  -- Chờ AI dịch
                          'pending_review',     -- Đã dịch, chờ duyệt
                          'approved',           -- Đã duyệt, chờ sync
                          'syncing',            -- Đang sync lên hệ thống kia
                          'synced',             -- Đã sync thành công
                          'update_pending',     -- Có thay đổi từ 1 phía, chờ sync lại
                          'conflict',           -- Conflict giữa 2 phía
                          'archived'            -- Không còn sync nữa
                      )),
    
    -- Content (immutable — version riêng cho mỗi lần thay đổi)
    current_revision   INTEGER NOT NULL DEFAULT 1,
    
    -- Field-level tracking
    -- Mỗi field lưu: { source_system, value, updated_at }
    -- Để biết ai cập nhật field nào, lúc nào
    fields_json        TEXT NOT NULL DEFAULT '{}',
    -- {
    --   "summary":     { "backlog": "ログイン画面でエラー", "jira": null, "cis": "..." },
    --   "description": { "backlog": "...", "jira": null, "cis": "..." },
    --   "status":      { "backlog": "Open", "jira": "To Do", "cis": null },
    --   "priority":    { "backlog": "High", "jira": null, "cis": null },
    --   "assignee":    { "backlog": "tanaka", "jira": null, "cis": null },
    --   "issue_type":  { "backlog": "バグ修正", "jira": "Task", "cis": null }
    -- }
    
    -- Dịch thuật
    translation_status TEXT NOT NULL DEFAULT 'not_needed'
                      CHECK(translation_status IN (
                          'not_needed',       -- Không cần dịch (cùng ngôn ngữ)
                          'pending',          -- Chưa dịch
                          'ai_draft',         -- AI đã dịch
                          'reviewed',         -- Đã review
                          'manual'            -- Dịch thủ công
                      )),
    
    -- Hash để detect thay đổi
    backlog_hash       TEXT,
    jira_hash          TEXT,
    
    -- Timestamps
    backlog_updated_at TEXT,
    jira_updated_at    TEXT,
    last_synced_at     TEXT,
    created_at         TEXT DEFAULT (datetime('now')),
    updated_at         TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_backlog_key ON issues(project_id, backlog_issue_key);
CREATE INDEX idx_issues_jira_key ON issues(project_id, jira_issue_key);
```

---

## 3. `issue_revisions` — Content history

Mỗi lần issue content thay đổi (từ Backlog hoặc Jira), tạo revision mới. Không ghi đè.

```sql
CREATE TABLE issue_revisions (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_id          TEXT NOT NULL REFERENCES issues(id),
    revision          INTEGER NOT NULL,
    
    source            TEXT NOT NULL,              -- 'backlog' | 'jira' | 'manual' | 'ai'
    source_event_id   TEXT,                        -- ID từ webhook event
    
    -- Full snapshot của content tại revision này
    summary           TEXT NOT NULL,
    description       TEXT,
    issue_type        TEXT,
    priority          TEXT,
    assignee          TEXT,
    -- Có thể mở rộng: custom fields dạng JSON
    
    attachments       TEXT DEFAULT '[]',          -- JSON array of {filename, url}
    
    created_at        TEXT DEFAULT (datetime('now')),
    
    UNIQUE(issue_id, revision)
);

CREATE INDEX idx_revisions_issue ON issue_revisions(issue_id, revision);
```

---

## 4. `issue_comments` — Comments từ cả 2 hệ thống

```sql
CREATE TABLE issue_comments (
    id                TEXT PRIMARY KEY,           -- UUID
    
    issue_id          TEXT NOT NULL REFERENCES issues(id),
    
    -- Identifiers
    backlog_comment_id   TEXT,                    -- NULL nếu tạo từ Jira
    jira_comment_id      TEXT,                    -- NULL nếu chưa sync
    
    -- Nội dung gốc
    source             TEXT NOT NULL CHECK(source IN ('backlog', 'jira', 'manual')),
    content_original   TEXT NOT NULL,             -- Ngôn ngữ gốc
    content_translated TEXT,                      -- Bản dịch (nếu cần)
    
    -- Trạng thái
    sync_status        TEXT NOT NULL DEFAULT 'pending'
                       CHECK(sync_status IN ('pending', 'synced', 'skipped', 'failed')),
    
    -- Metadata
    author             TEXT,
    created_at_backlog TEXT,
    created_at_jira    TEXT,
    created_at_cis     TEXT DEFAULT (datetime('now')),
    
    UNIQUE(issue_id, backlog_comment_id),
    UNIQUE(issue_id, jira_comment_id)
);

CREATE INDEX idx_comments_issue ON issue_comments(issue_id);
```

---

## 5. `translation_queue` — Hàng chờ dịch

```sql
CREATE TABLE translation_queue (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_id          TEXT NOT NULL REFERENCES issues(id),
    comment_id        TEXT REFERENCES issue_comments(id),  -- NULL nếu là issue, không phải comment
    
    target_type       TEXT NOT NULL CHECK(target_type IN ('issue', 'comment')),
    target_lang       TEXT NOT NULL DEFAULT 'vi',
    
    -- Bản dịch
    ai_draft          TEXT,                      -- Bản AI propose
    reviewed_text     TEXT,                      -- Bản đã duyệt/sửa
    review_status     TEXT NOT NULL DEFAULT 'pending'
                      CHECK(review_status IN ('pending', 'ai_draft', 'approved', 'rejected', 'edited')),
    review_notes      TEXT,                      -- Ghi chú của reviewer
    
    -- AI context (để debug / học)
    ai_model          TEXT,                      -- GPT-4, Claude, v.v.
    ai_prompt_version TEXT,
    ai_confidence     REAL,                      -- 0-1
    
    created_at        TEXT DEFAULT (datetime('now')),
    reviewed_at       TEXT,
    reviewed_by       TEXT                        -- User ID
);

CREATE INDEX idx_translation_queue_status ON translation_queue(review_status);
CREATE INDEX idx_translation_queue_issue ON translation_queue(issue_id);
```

---

## 6. `sync_journal` — Audit trail mở rộng

Thay thế `sync_events` hiện tại.

```sql
CREATE TABLE sync_journal (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    
    sync_job_id       TEXT,
    issue_id          TEXT REFERENCES issues(id),
    comment_id        TEXT REFERENCES issue_comments(id),
    project_id        TEXT NOT NULL REFERENCES projects(id),
    
    direction_from    TEXT NOT NULL CHECK(direction_from IN ('backlog', 'jira', 'cis')),
    direction_to      TEXT NOT NULL CHECK(direction_to IN ('backlog', 'jira', 'cis')),
    action            TEXT NOT NULL CHECK(action IN (
                          'create', 'update', 'skip', 'rollback',
                          'translate_ai', 'translate_review', 'translate_reject',
                          'map_suggest', 'map_approve', 'map_reject',
                          'anomaly_detect', 'anomaly_clear',
                          'status_change', 'field_change'
                      )),
    status            TEXT NOT NULL CHECK(status IN ('success', 'failed', 'pending', 'cancelled')),
    
    -- Chi tiết thay đổi
    field_name        TEXT,                      -- Field bị thay đổi (nếu action = field_change)
    old_value         TEXT,
    new_value         TEXT,
    
    -- Error handling
    error_message     TEXT,
    retry_count       INTEGER DEFAULT 0,
    
    -- Trigger
    trigger           TEXT NOT NULL DEFAULT 'auto'
                      CHECK(trigger IN ('webhook', 'manual', 'scheduled', 'ai')),
    executed_by       TEXT,                      -- User ID nếu manual
    
    created_at        TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_journal_issue ON sync_journal(issue_id);
CREATE INDEX idx_journal_job ON sync_journal(sync_job_id);
CREATE INDEX idx_journal_project ON sync_journal(project_id);
CREATE INDEX idx_journal_created ON sync_journal(created_at);
CREATE INDEX idx_journal_direction ON sync_journal(direction_from, direction_to, status);
CREATE INDEX idx_journal_from ON sync_journal(direction_from, status);
CREATE INDEX idx_journal_to ON sync_journal(direction_to, status);
```

---

## 6.1. `sync_jobs` — Hàng chờ inbound/outbound

`sync_jobs` là queue nội bộ cho cả hai chiều **System -> CIS -> System**. Webhook hoặc manual pull tạo inbound job; approval/dry-run/manual sync tạo outbound job.

```sql
CREATE TABLE sync_jobs (
    id                TEXT PRIMARY KEY,
    project_id        TEXT NOT NULL REFERENCES projects(id),
    issue_id          TEXT REFERENCES issues(id),
    comment_id        TEXT REFERENCES issue_comments(id),
    
    direction_from    TEXT NOT NULL CHECK(direction_from IN ('backlog', 'jira', 'cis')),
    direction_to      TEXT NOT NULL CHECK(direction_to IN ('backlog', 'jira', 'cis')),
    job_type          TEXT NOT NULL CHECK(job_type IN (
                          'webhook_ingest',
                          'manual_pull',
                          'dry_run',
                          'push_issue',
                          'push_comment',
                          'push_attachment',
                          'retry'
                      )),
    status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK(status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
    
    payload_json      TEXT NOT NULL DEFAULT '{}',
    dedupe_key        TEXT,
    priority          INTEGER NOT NULL DEFAULT 100,
    retry_count       INTEGER NOT NULL DEFAULT 0,
    run_after         TEXT DEFAULT (datetime('now')),
    locked_at         TEXT,
    locked_by         TEXT,
    error_message     TEXT,
    
    created_at        TEXT DEFAULT (datetime('now')),
    updated_at        TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_sync_jobs_dedupe ON sync_jobs(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX idx_sync_jobs_pending ON sync_jobs(status, run_after, priority);
CREATE INDEX idx_sync_jobs_issue ON sync_jobs(issue_id);
CREATE INDEX idx_sync_jobs_direction ON sync_jobs(direction_from, direction_to, status);
```

---

## 7. `mapping_rules` — Mapping học được

Mỗi dòng là mapping giữa một system (Backlog, Jira, Slack...) và CIS. CIS là canonical value — các system không map trực tiếp với nhau.

```sql
CREATE TABLE mapping_rules (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id        TEXT NOT NULL REFERENCES projects(id),
    
    mapping_type      TEXT NOT NULL CHECK(mapping_type IN (
                          'issue_type', 'status', 'priority', 'user', 'component'
                      )),
    
    direction_from    TEXT NOT NULL CHECK(direction_from IN ('backlog', 'jira', 'cis', 'slack', 'email', 'manual')),
    direction_to      TEXT NOT NULL CHECK(direction_to IN ('backlog', 'jira', 'cis', 'slack', 'email', 'manual')),
    
    from_value        TEXT NOT NULL,             -- Giá trị bên hệ thống nguồn
    to_value          TEXT NOT NULL,             -- Giá trị bên hệ thống đích
    
    -- Học từ AI
    confidence        REAL NOT NULL DEFAULT 0.5, -- 0-1
    source_type       TEXT NOT NULL CHECK(source_type IN (
                          'manual',           -- User nhập tay
                          'config_initial',   -- Từ config file ban đầu
                          'ai_auto',          -- AI tự động detect
                          'ai_learned',       -- AI học từ lịch sử
                          'auto_synced'       -- Tự động từ dữ liệu
                      )),
    
    -- Usage tracking
    usage_count       INTEGER NOT NULL DEFAULT 0,
    last_used_at      TEXT,
    first_seen_at     TEXT DEFAULT (datetime('now')),
    last_confirmed_at TEXT,
    
    UNIQUE(project_id, mapping_type, direction_from, direction_to, from_value)
);

CREATE INDEX idx_mapping_rules_project ON mapping_rules(project_id, mapping_type);
CREATE INDEX idx_mapping_rules_from ON mapping_rules(direction_from, from_value);
CREATE INDEX idx_mapping_rules_to ON mapping_rules(direction_to, to_value);
```

---

## 8. `anomaly_log` — Phát hiện bất thường

```sql
CREATE TABLE anomaly_log (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id        TEXT NOT NULL REFERENCES projects(id),
    
    anomaly_type      TEXT NOT NULL CHECK(anomaly_type IN (
                          'batch_operation',     -- Nhiều issue cùng lúc
                          'duplicate_content',   -- Nội dung trùng lặp
                          'unusual_field_change',-- Field thay đổi bất thường
                          'routing_mismatch',    -- Issue không khớp project nào
                          'translation_low_conf',-- Dịch thuật độ tin cậy thấp
                          'mapping_gap',         -- Thiếu mapping
                          'sync_failure_chain'   -- Nhiều sync failure liên tiếp
                      )),
    
    severity          TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'critical')),
    status            TEXT NOT NULL DEFAULT 'open'
                      CHECK(status IN ('open', 'investigating', 'resolved', 'ignored')),
    
    -- Dữ liệu
    issue_id          TEXT REFERENCES issues(id),
    details           TEXT,                      -- JSON chi tiết
    ai_analysis       TEXT,                      -- AI phân tích
    
    created_at        TEXT DEFAULT (datetime('now')),
    resolved_at       TEXT,
    resolved_by       TEXT
);

CREATE INDEX idx_anomaly_status ON anomaly_log(status);
CREATE INDEX idx_anomaly_project ON anomaly_log(project_id);
```

---

## 9. `webhook_events` — Raw log của tất cả webhook

```sql
CREATE TABLE webhook_events (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    
    project_id        TEXT REFERENCES projects(id),
    source            TEXT NOT NULL CHECK(source IN ('backlog', 'jira')),
    event_type        TEXT NOT NULL,             -- 'issue_created', 'issue_updated', 'comment_added'
    event_id          TEXT,                      -- ID từ bên gửi webhook
    dedupe_key        TEXT,
    payload_hash      TEXT,
    status            TEXT NOT NULL DEFAULT 'received'
                      CHECK(status IN ('received', 'queued', 'processed', 'duplicate', 'rejected', 'unmatched_project', 'failed')),
    
    raw_payload       TEXT NOT NULL,             -- JSON gốc (để debug)
    processed         INTEGER NOT NULL DEFAULT 0,
    processing_error  TEXT,
    
    created_at        TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_webhook_events_dedupe ON webhook_events(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX idx_webhook_events_project ON webhook_events(project_id, created_at);
CREATE INDEX idx_webhook_events_status ON webhook_events(status, created_at);
```

---

## Entity Relationship

```
projects ──── issues ──── issue_revisions
                  ├── issue_comments
                  ├── translation_queue
                  └── anomaly_log

projects ──── mapping_rules
projects ──── sync_jobs ←── issues, issue_comments
projects ──── sync_journal ←── sync_jobs, issues, issue_comments
               
projects ──── webhook_events
```
