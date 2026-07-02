# Backlog → CIS — Ingest

## Trigger

Code Lite hiện tại dùng manual pull Backlog qua Admin/API làm đường inbound chính. Backlog webhook chưa có route trong code Lite hiện tại; webhook là phần chuẩn bị cho Medium hoặc phase sau.

Manual pull từ Admin UI:
  - POST /api/v1/projects/:projectId/backlog/pull
  - POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull

`POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull` enqueue job `manual_pull` rồi chạy ngay job đó trong request để issue được cập nhật vào CIS tức thì. `POST /api/v1/projects/:projectId/backlog/pull` gọi Backlog API lấy danh sách issue trong project và enqueue nhiều job `manual_pull`.

Manual pull dùng cho import ban đầu hoặc đồng bộ lại một issue cụ thể. Job tạo ra dùng `direction_from = 'backlog'`, `direction_to = 'cis'`; worker normalize dữ liệu rồi upsert vào CIS.

---

## Flow

```
1. Admin/API gọi manual pull
   ├── `POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull`: enqueue rồi chạy ngay job `manual_pull`
   └── `POST /api/v1/projects/:projectId/backlog/pull`: lấy danh sách issue rồi enqueue nhiều job `manual_pull`

2. Xác định project
   ├── Tra projects table bằng `projectId` trong route
   └── Nếu không tìm thấy → anomaly_log + dừng

3. Tìm hoặc tạo issue trong CIS
   ├── Tra issues WHERE project_id = ? AND backlog_issue_key = ?
   ├── Nếu chưa có → INSERT với source = 'backlog', sync_status = 'ingested'
   └── Nếu đã có → kiểm tra backlog_hash có thay đổi không?

4. Xử lý theo dữ liệu đã fetch từ Backlog API

   [issue.created]
   ├── Fetch full issue từ Backlog API (webhook payload không đầy đủ)
   ├── INSERT issue_revisions (revision 1)
   ├── UPDATE issues: fields_json, current_revision = 1, sync_status = 'ingested'
   └── Translation không chạy trong inbound; nếu cần, tạo translation_queue bằng option riêng sau khi dữ liệu đã vào CIS.

   [issue.updated]
   ├── Fetch issue từ Backlog API
   ├── So sánh content với revision hiện tại
   ├── Nếu thay đổi → INSERT issue_revisions (revision +1)
   ├── UPDATE issues: fields_json, current_revision, backlog_hash
   ├── Chỉ field nào thay đổi → cập nhật fields_json tương ứng
   ├── Nếu content (summary/description) thay đổi:
   │   ├── Giữ nguyên bản dịch cũ (không tự động dịch lại)
   │   └── sync_status = 'update_pending' + notification
   └── Nếu chỉ metadata (status/priority) thay đổi:
       ├── Không cần dịch lại
       └── sync_status = 'update_pending' (chờ sync field change lên Jira)

   [issue.comment_added]
   ├── INSERT issue_comments với source = 'backlog'
   ├── content_original = comment content (tiếng Nhật)
   └── Translation không chạy trong inbound; nếu cần, xử lý bằng option riêng sau khi comment đã vào CIS.

5. Ghi sync_journal
   ├── direction_from = 'backlog', direction_to = 'cis'
   ├── action = 'create' | 'update' | 'comment_added'
   └── status = 'success'
```

---

## Xử lý đặc biệt

### Issue mới không có mapping

```
Backlog issue type mới, chưa có trong mapping_rules
  → AI đọc tên type + content + mapping hiện có
  → Suggest mapping vào mapping_rules (confidence < 1)
  → Anomaly log: severity = 'warning', type = 'mapping_gap'
  → Pause sync, chờ user confirm mapping
```

### Issue từ project không có config

```
Backlog projectKey không khớp bất kỳ project nào
  → Anomaly log: severity = 'warning', type = 'routing_mismatch'
  → Không ingest vào CIS
  → Notification đến admin
```

### Thay đổi content đột ngột

```
Backlog issue cũ, content thay đổi lớn sau nhiều ngày
  → So sánh revision cũ và mới → diff ratio > 50%
  → Anomaly log: severity = 'info', type = 'unusual_field_change'
  → Vẫn ingest bình thường, không block
```

---

## Data mapping: Backlog → CIS fields

| Backlog field | CIS fields_json key | Ghi chú |
|--------------|-------------------|---------|
| `issueKey` | — | `issues.backlog_issue_key` |
| `projectKey` | — | Xác định `project_id` |
| `summary` | `summary.backlog` | |
| `description` | `description.backlog` | |
| `issueType.name` | `issue_type.backlog` | |
| `status.name` | `status.backlog` | |
| `priority.name` | `priority.backlog` | |
| `assignee.name` | `assignee.backlog` | |
| `created` | — | `issues.backlog_updated_at` |
| `updated` | — | Cập nhật `backlog_hash` |
| `attachments[]` | — | Lưu metadata vào `issue_attachments`, download file thật về `storage/attachments`, cập nhật `download_status` |
| `externalFileLinks[]` | `external_file_links.backlog` | Link ngoài, không phải attachment file thật để download |

Attachment Backlog -> CIS:

- Download file chạy inline trong job ingest/manual pull sau khi metadata đã được upsert.
- Không tạo `sync_jobs` riêng cho download attachment về CIS.
- `download_status` là trạng thái tải file từ Backlog về CIS storage.
- `sync_status` là trạng thái đẩy attachment từ CIS sang hệ thống đích như Jira, nên sau Backlog -> CIS vẫn có thể là `pending`.
- Retry download dùng API `POST /api/v1/attachments/:attachmentId/retry-download`.
