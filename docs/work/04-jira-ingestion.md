# Jira ↔ CIS — Inbound và outbound qua CIS

## Jira là nơi làm việc chính

Dev thao tác hàng ngày trên Jira:
- Update status (In Progress → Resolved)
- Add comment (trả lời, hỏi lại)
- Change assignee
- Update Sprint, Story Points, Epic Link
- Thêm attachment, link

Tất cả đều cần đi về CIS trước. Nếu cần thông báo lại cho khách hàng thì CIS sẽ tạo outbound job riêng về Backlog ở phase sau.

---

## Trigger

```
Jira Webhook:
  - issue_created        (ít khi — issue tạo từ Jira)
  - issue_updated        (status, assignee, field)
  - comment_created      (dev trả lời)
  - comment_updated
```

---

## Manual pull: Jira → CIS

Webhook là đường tự động, nhưng Admin UI vẫn cần manual pull để import ban đầu, recover khi webhook bị miss, hoặc kiểm tra lại một issue cụ thể.

```
POST /api/projects/:projectId/jira/pull
POST /api/projects/:projectId/jira/issues/:jiraIssueKey/pull
```

Manual pull dùng cùng normalizer với webhook:

1. Gọi Jira API lấy issue/comment/attachment.
2. Normalize thành internal event payload.
3. Upsert vào CIS.
4. Ghi sync_journal với trigger = 'manual'.

---

## Flow: Jira update → CIS

```
1. Webhook receive
   ├── Verify signature (dùng jira_webhook_secret)
   ├── Lưu raw_payload vào webhook_events
   └── Parse event_type + issue key (WEC1-789)

2. Tìm issue trong CIS
   ├── Tra issues WHERE project_id = ? AND jira_issue_key = 'WEC1-789'
   ├── Nếu không tìm thấy:
   │   └── Có thể issue được tạo trực tiếp trên Jira → cần ingest 2 chiều
   │   └── INSERT với source = 'jira', status = 'ingested'
   └── Nếu tìm thấy → tiếp tục

3. Phân loại thay đổi

   [status change]
   ├── Dev chuyển "In Progress" → "Resolved"
   ├── UPDATE issues.fields_json → status.jira = 'Resolved'
   ├── UPDATE issues.status = 'update_pending'
   └── Cần sync về Backlog? → optional, tuỳ config

   [field change: assignee, Sprint, Story Points]
   ├── UPDATE fields_json tương ứng
   └── Chỉ sync về Backlog nếu field có mapping (assignee có thể, Sprint không)

   [comment from dev]
   ├── INSERT issue_comments với source = 'jira'
   ├── content_original = comment (tiếng Việt)
   ├── content_translated = NULL (không cần dịch vì dev viết bằng tiếng Việt)
   └── Nếu cần sync về Backlog cho khách hàng Nhật:
       ├── AI translate Việt → Nhật
       └── translation_queue với target_lang = 'ja'

   [attachment from dev]
   ├── Tải file thật từ Jira về storage nội bộ
   ├── Lưu metadata/hash vào CIS
   └── Chỉ push về Backlog nếu phase sau có rule cho attachment

4. Ghi sync_journal
   ├── direction_from = 'jira', direction_to = 'cis'
   ├── action = 'field_change' | 'comment_added'
   └── status = 'success'
```

---

## Flow: CIS → Jira (issue đã duyệt)

Bước này xảy ra sau khi issue từ Backlog được translate + review.

```
1. Trigger: issue trong CIS có status = 'approved'

2. Lấy dữ liệu:
   ├── project_id → jira_project_key
   ├── fields_json → lấy các field có backlog value
   └── translation_queue.reviewed_text → bản dịch đã duyệt

3. Build Jira payload:
   ├── project_key: jira_project_key
   ├── issue_type: từ mapping_rules (backlog_type → jira_type)
   ├── summary: kết hợp backlog summary + backlog key prefix
   ├── description: build từ template:
   │   ├── Backlog issue key + URL (traceability)
   │   ├── Bản dịch tiếng Việt (đã review)
   │   └── Original Nhật (giữ nguyên)
   ├── priority: từ mapping_rules
   ├── labels: ['backlog-migrated', project_labels]
   └── custom fields nếu cần (Story Points = 0, v.v.)

4. Gọi Jira API:
   ├── POST /rest/api/3/issue (tạo mới)
   └── PUT /rest/api/3/issue/WEC1-789 (update)

5. Cập nhật CIS:
   ├── UPDATE issues: jira_issue_key, status = 'synced', last_synced_at
   └── UPDATE issues.fields_json: status.jira = mapped_status

6. Ghi sync_journal: direction_from = 'cis', direction_to = 'jira', action = 'create' | 'update', status = 'success'
```

---

## Flow: CIS → Backlog (sync ngược)

Chỉ xảy ra khi:
- Dev thay đổi status cần thông báo cho khách hàng (Resolved → thông báo fix)
- Dev thêm comment cần reply cho khách hàng Nhật

```
1. Trigger:
   ├── Manual: user chọn issue → "Sync ngược về Backlog"
   └── Auto rule: status = 'Resolved' + config.sync_backlog_resolved = true

2. Nếu comment dev viết bằng tiếng Việt:
   ├── AI translate Việt → Nhật
   ├── translation_queue với target_lang = 'ja'
   └── Chờ review? → tuỳ config (có thể auto nếu confidence cao)

3. Gọi Backlog API:
   ├── POST /api/v2/issues/ONE_KYORITSU-123/comments
   └── Nội dung: [Jira] WEC1-789: <bản dịch tiếng Nhật>

4. Ghi sync_journal: direction_from = 'cis', direction_to = 'backlog', action = 'comment_added'
```

---

## Field mapping: Jira ↔ CIS ↔ Backlog

| Field | Jira → CIS | CIS → Backlog | Ghi chú |
|-------|-----------|--------------|---------|
| status | ✅ luôn | ⚠️ tuỳ config | Resolved → 完了, In Progress → 着手 |
| assignee | ✅ luôn | ⚠️ nếu có mapping user | Cần mapping user Jira → Backlog |
| priority | ✅ nếu dev change | ⚠️ | Ít khi thay đổi từ Jira |
| Sprint | ✅ lưu CIS | ❌ không về Backlog | Backlog không có Sprint |
| Story Points | ✅ lưu CIS | ❌ | Backlog không có |
| Epic Link | ✅ lưu CIS | ❌ | Backlog không có |
| comment (dev) | ✅ luôn | ⚠️ cần translate Việt → Nhật | |
| attachment | ✅ lưu file + metadata vào CIS | ⚠️ phase sau | MVP cần copy file thật Backlog → CIS → Jira; chiều Jira → Backlog để sau |
