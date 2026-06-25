# Backlog → CIS — Ingest

## Trigger

```
Backlog Webhook:
  - issue.created
  - issue.updated
  - issue.comment_added
  - issue.comment_updated
```

Manual pull từ Admin UI:
  - POST /api/projects/:projectId/backlog/pull
  - POST /api/projects/:projectId/backlog/issues/:backlogIssueKey/pull

Backlog gửi webhook mỗi khi có thay đổi. CIS nhận, validate signature, và xử lý.

Manual pull dùng cho import ban đầu, recover khi webhook bị miss, hoặc đồng bộ lại một issue cụ thể. Cả webhook và manual pull đều tạo job `direction_from = 'backlog', direction_to = 'cis'`; worker normalize dữ liệu rồi upsert vào CIS.

---

## Flow

```
1. Webhook receive
   ├── Verify signature (dùng backlog_webhook_secret)
   ├── Lưu raw_payload vào webhook_events
   └── Parse event_type

2. Xác định project
   ├── Tra projects table bằng projectKey từ payload
   └── Nếu không tìm thấy → anomaly_log + dừng

3. Tìm hoặc tạo issue trong CIS
   ├── Tra issues WHERE project_id = ? AND backlog_issue_key = ?
   ├── Nếu chưa có → INSERT với source = 'backlog', status = 'ingested'
   └── Nếu đã có → kiểm tra backlog_hash có thay đổi không?

4. Xử lý theo event_type

   [issue.created]
   ├── Fetch full issue từ Backlog API (webhook payload không đầy đủ)
   ├── INSERT issue_revisions (revision 1)
   ├── UPDATE issues: fields_json, current_revision = 1, status = 'pending_translate'
   ├── Nếu auto_translate = true → AI translate (translation_queue)
   └── Nếu auto_translate = false → notification + chờ manual

   [issue.updated]
   ├── Fetch issue từ Backlog API
   ├── So sánh content với revision hiện tại
   ├── Nếu thay đổi → INSERT issue_revisions (revision +1)
   ├── UPDATE issues: fields_json, current_revision, backlog_hash
   ├── Chỉ field nào thay đổi → cập nhật fields_json tương ứng
   ├── Nếu content (summary/description) thay đổi:
   │   ├── Giữ nguyên bản dịch cũ (không tự động dịch lại)
   │   └── status = 'update_pending' + notification
   └── Nếu chỉ metadata (status/priority) thay đổi:
       ├── Không cần dịch lại
       └── status = 'update_pending' (chờ sync field change lên Jira)

   [issue.comment_added]
   ├── INSERT issue_comments với source = 'backlog'
   ├── content_original = comment content (tiếng Nhật)
   ├── Nếu auto_translate → AI translate → translation_queue
   └── (Comment sync lên Jira sau khi dịch + duyệt)

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
