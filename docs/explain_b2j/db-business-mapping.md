# backlog2jira — DB Schema & Business Mapping

## Tổng quan

4 tables trong state DB phục vụ đúng 4 câu hỏi business:

| Table | Trả lời câu hỏi |
|-------|----------------|
| `projects` | **Project nào đang được đồng bộ?** |
| `issue_mappings` | **Issue nào đã tạo trên Jira?** — tránh tạo trùng |
| `comment_mappings` | **Comment nào đã sync?** — tránh sync trùng |
| `sync_events` | **Ai đã làm gì, khi nào?** — audit trail đầy đủ |

---

## `projects` — Danh sách project

### Business mapping

Một dòng = một **cặp Backlog ↔ Jira project** đã được cấu hình.

| Column | Business meaning | Ví dụ |
|--------|-----------------|-------|
| `id` | Tên rút gọn của project, dùng để tham chiếu | `"wecsy-main"` |
| `name` | Tên hiển thị | `"Wecsy Main"` |
| `backlog_project_key` | Project key bên Backlog của khách hàng Nhật | `"ONE_KYORITSU"` |
| `backlog_issue_key_prefix` | Prefix để nhận diện issue thuộc project nào | `"ONE_KYORITSU-"` |
| `jira_project_key` | Project key bên Jira của team dev | `"WEC1"` |
| `config_path` | Đường dẫn file config (để sau này so sánh thay đổi) | `"projects/wecsy-main.json"` |
| `updated_at` | Lần cuối project config được upsert | `"2026-06-23T10:00:00"` |

### Luồng business

```
Codex nhận yêu cầu "đồng bộ issue A" 
  → upsertProjectFromConfig() ghi project vào bảng này
  → lần sau không cần đọc lại config, chỉ cần tra state
  → nếu config thay đổi, upsert lại sẽ ghi đè
```

---

## `issue_mappings` — Tracking issue đã tạo

### Business mapping

Một dòng = một **issue Backlog đã được tạo thành công trên Jira**.

| Column | Business meaning | Ví dụ |
|--------|-----------------|-------|
| `project_id` | Issue này thuộc project nào | `"wecsy-main"` |
| `backlog_issue_key` | ID gốc trên Backlog (do khách hàng Nhật tạo) | `"ONE_KYORITSU-123"` |
| `jira_issue_key` | ID tương ứng trên Jira (do team dev dùng) | `"WEC1-789"` |
| `backlog_updated_at` | Thời điểm Backlog issue được cập nhật lần cuối — để phát hiện thay đổi | `"2026-06-22T15:00:00"` |
| `jira_updated_at` | Thời điểm Jira issue được cập nhật lần cuối — để phát hiện cần re-sync | `"2026-06-23T10:00:00"` |
| `source_hash` | Hash nội dung issue Backlog — để detect thay đổi chính xác hơn updated_at | `"abc123..."` |
| `last_synced_at` | Lần sync gần nhất giữa Backlog và Jira | `"2026-06-23T10:00:00"` |

### Business rules được enforce bởi schema

- **No duplicate sync**: `PRIMARY KEY (project_id, backlog_issue_key)` — mỗi Backlog issue chỉ được tạo một lần trên Jira. Nếu cố upsert lại, nó sẽ UPDATE thay vì INSERT.
- **Tra ngược được**: Index trên `jira_issue_key` — cho phép tìm "Jira issue WEC1-789 đến từ Backlog issue nào?"

### Luồng business

```
Codex tạo issue thành công trên Jira, nhận được WEC1-789
  → ghi mapping để lần sau kiểm tra: "issue này đã sync chưa?"
  → nếu có re-sync, so sánh backlog_updated_at với lần sync trước
      → nếu backlog_updated_at > last_synced_at: có thay đổi cần cập nhật
      → nếu không: bỏ qua, không tốn Jira API call
```

---

## `comment_mappings` — Tracking comment đã sync

### Business mapping

Một dòng = một **comment trên Backlog đã được đồng bộ sang Jira**.

| Column | Business meaning | Ví dụ |
|--------|-----------------|-------|
| `project_id` | Comment thuộc project nào | `"wecsy-main"` |
| `backlog_issue_key` | Issue gốc trên Backlog có chứa comment này | `"ONE_KYORITSU-123"` |
| `backlog_comment_id` | ID của comment trên Backlog (do Nulab sinh ra) | `"1001"` |
| `jira_comment_id` | ID của comment tương ứng trên Jira (nullable — có thể chưa tạo) | `"20001"` |
| `synced_at` | Thời điểm comment được sync | `"2026-06-23T10:05:00"` |

### Business rules

- **No duplicate comment sync**: `PRIMARY KEY (project_id, backlog_issue_key, backlog_comment_id)` — mỗi comment Backlog chỉ sync một lần
- **Cascade delete với issue**: Khi xóa issue mapping, tự động xóa comment mappings — tránh orphan data
- **jira_comment_id nullable**: Cho phép ghi nhận comment đã được xử lý (sync attempt) ngay cả khi tạo thất bại

### Luồng business

```
Hàng ngày, Codex chạy job "đồng bộ comments mới"
  → fetch tất cả comments từ Backlog API
  → findUnsyncedBacklogComments() so state DB với API response
      → comments có trong Backlog nhưng chưa có trong DB = chưa sync
      → comments đã có trong DB = đã sync, bỏ qua
  → chỉ sync những comment chưa có
```

---

## `sync_events` — Audit trail

### Business mapping

Một dòng = một **sự kiện trong quá trình đồng bộ** — ghi lại tất cả hành động quan trọng.

| Column | Business meaning | Ví dụ |
|--------|-----------------|-------|
| `id` | Số thứ tự sự kiện (auto-increment) | `1` |
| `project_id` | Sự kiện xảy ra ở project nào | `"wecsy-main"` |
| `backlog_issue_key` | Liên quan đến issue nào (nullable — có thể là sự kiện global) | `"ONE_KYORITSU-123"` |
| `action` | Hành động gì | `"create_jira_issue"`, `"update_jira_issue"`, `"sync_comment"`, `"skip_duplicate"`, `"error_validation"` |
| `status` | Kết quả | `"success"`, `"failure"`, `"skipped"` |
| `message` | Chi tiết (đặc biệt hữu ích khi failure) | `"Jira API timeout"`, `"Issue already exists at WEC1-789"` |
| `created_at` | Thời điểm sự kiện xảy ra | `"2026-06-23T10:00:01"` |

### Business rules

- **Không có implicit operation**: Mọi hành động đều được ghi vào sync_events — tạo, update, skip, failure
- **Index cho phép trace nhanh**: `(project_id, backlog_issue_key, created_at)` — ai đó muốn biết "chuyện gì xảy ra với issue ONE_KYORITSU-123" chỉ cần query với index này
- **Cascade delete**: Xóa project → xóa tất cả events (phù hợp với GDPR-like data retention)

### Luồng business

```
Khi có bất kỳ vấn đề gì với đồng bộ:
  → support kiểm tra bảng sync_events thay vì hỏi developer
  → biết chính xác: action gì, khi nào, success hay failure, lỗi gì
Ví dụ: "Tại sao issue WEC1-789 không có description?"
  → query sync_events WHERE jira_issue_key = 'WEC1-789' AND action = 'create_jira_issue'
  → thấy status = success và payload đã gửi → vấn đề nằm ở phía Jira
```

---

## Entity Relationship

```
projects (1) ────────── (N) issue_mappings ────────── (N) comment_mappings
   │                              │
   │                              │
   └────────────────── (N) sync_events
```

## Các câu query business & cách schema trả lời

| Câu hỏi business | SQL / State DB query |
|-----------------|----------------------|
| Issue ONE_KYORITSU-123 đã tạo trên Jira chưa? | `getIssueMapping("wecsy-main", "ONE_KYORITSU-123")` |
| Issue ONE_KYORITSU-123 có gì thay đổi không? | So sánh `backlog_updated_at` với `last_synced_at` |
| Comment nào chưa sync? | `findUnsyncedBacklogComments()` — diff API response với state DB |
| Có bao nhiêu issue đã sync hôm nay? | `listSyncEvents("wecsy-main", "2026-06-23")` |
| Sync event gần nhất bị failed? | `listSyncEvents("wecsy-main", { status: "failure", limit: 10 })` |
| Jira issue WEC1-789 từ Backlog issue nào? | Query issue_mappings WHERE jira_issue_key = "WEC1-789" |
| Project nào đang active? | `listProjects()` |

## Data flow mapping

```
Business                    Codex                          DB
────────                    ─────                          ──
Khách hàng tạo issue        Fetch Backlog API              ┐
trên Backlog                → validate với config           │ ── issue_mappings
                            → map sang Jira payload        │     (nếu chưa có)
                            → gọi Jira API                 │
                            → upsertIssueMapping()          ┘

Khách hàng comment          Fetch Backlog comments          ┐
trên Backlog                → findUnsyncedBacklogComments() │ ── comment_mappings
                            → sync từng comment mới        │
                            → markCommentSynced()           ┘

Mọi hành động               → addSyncEvent()               ── sync_events

Thêm project mới            upserProjectFromConfig()       ── projects
```
