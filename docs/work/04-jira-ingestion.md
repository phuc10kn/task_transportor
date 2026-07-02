# Jira ↔ CIS — Trạng thái Lite hiện tại

## Trạng thái triển khai hiện tại cho Lite

- Code Lite hiện tại chưa triển khai Jira webhook, Jira issue pull, hoặc Jira -> CIS normalizer. Không có route `POST /api/v1/projects/:projectId/jira/pull` và không có route `POST /api/v1/projects/:projectId/jira/issues/:jiraIssueKey/pull`.
- Phần Jira đã có trong Lite gồm:
  - `POST /api/v1/projects/:projectId/jira/mapping-values/pull` để kéo catalog mapping values từ Jira.
  - `POST /api/v1/issues/:issueId/dry-run/jira` để validate/build payload Jira.
  - `POST /api/v1/issues/:issueId/sync/jira` để enqueue `push_issue`.
- Outbound `CIS -> Jira` trong Issue Editor không còn check translation queue/review bằng rule riêng trước khi sync. Translation vẫn là workflow review riêng, còn payload sync lấy từ canonical effective values. Lưu ý theo code Lite hiện tại: `issues.sync_status = 'pending_translate'` vẫn bị chặn bởi sync-state gate.
- Canonical effective priority: `fields_json.<field>.cis -> fields_json.<field>.backlog -> fields_json.<field>.jira -> revision fallback`.
- Main Issue Editor chỉ có nút `Jira sync`. Khi mở modal, UI chạy dry-run, duplicate các field sắp update lên Jira và cho admin chỉnh trước khi sync.
- Khi admin chỉnh field trong Jira sync modal rồi bấm `Sync Jira`, sync job dùng đúng payload đã preview. Các draft field có giá trị được lưu vào `fields_json.<field>.jira`; field để trống không xóa nhánh `.jira` cũ trong DB.
- Sync thật vẫn yêu cầu dry-run mới nhất khớp `canonical_hash`; nếu stale thì trả lỗi `DRY_RUN_STALE`.

## Jira là nơi làm việc chính sau Lite

Định hướng sau Lite là dev thao tác hàng ngày trên Jira:
- Update business status (In Progress → Resolved)
- Add comment (trả lời, hỏi lại)
- Change assignee
- Update Sprint, Story Points, Epic Link
- Thêm attachment, link

Các thay đổi này cần đi về CIS trước khi sync ngược về hệ khác. Phần Jira -> CIS này chưa có trong code Lite hiện tại; nếu cần thông báo lại cho khách hàng thì CIS sẽ tạo outbound job riêng về Backlog ở phase sau.

---

## Trigger dự kiến sau Lite

```
Jira Webhook:
  - issue_created        (ít khi — issue tạo từ Jira)
  - issue_updated        (business status, assignee, field)
  - comment_created      (dev trả lời)
  - comment_updated
```

---

## Manual pull: Jira → CIS dự kiến sau Lite

Webhook là đường tự động sau Lite, nhưng Admin UI có thể cần manual pull để import ban đầu, recover khi webhook bị miss, hoặc kiểm tra lại một issue cụ thể.

```
POST /api/v1/projects/:projectId/jira/pull
POST /api/v1/projects/:projectId/jira/issues/:jiraIssueKey/pull
```

Các endpoint trên chưa tồn tại trong code Lite hiện tại. Khi triển khai sau Lite, manual pull nên dùng cùng normalizer với webhook:

1. Gọi Jira API lấy issue/comment/attachment.
2. Normalize thành internal event payload.
3. Upsert vào CIS.
4. Ghi sync_journal với trigger = 'manual'.

---

## Flow dự kiến: Jira update → CIS

```
1. Webhook receive
   ├── Verify signature (dùng jira_webhook_secret)
   ├── Lưu raw_payload vào webhook_events
   └── Parse event_type + issue key (WEC1-789)

2. Tìm issue trong CIS
   ├── Tra issues WHERE project_id = ? AND jira_issue_key = 'WEC1-789'
   ├── Nếu không tìm thấy:
   │   └── Có thể issue được tạo trực tiếp trên Jira → cần ingest 2 chiều
   │   └── INSERT với source = 'jira', sync_status = 'ingested'
   └── Nếu tìm thấy → tiếp tục

3. Phân loại thay đổi

   [business status change]
   ├── Dev chuyển "In Progress" → "Resolved"
   ├── UPDATE issues.fields_json → status.jira = 'Resolved'
   ├── UPDATE issues.sync_status = 'update_pending'
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

## Flow: CIS → Jira (issue đủ điều kiện)

Bước này xảy ra sau khi issue từ Backlog đã vào CIS và mapping/anomaly/dry-run pass. Trong canonical Issue Editor flow, translation review không còn là gate trực tiếp; bản dịch đã approve chỉ là một cách cập nhật `fields_json.summary.cis` hoặc `fields_json.description.cis`. Sync vẫn phụ thuộc `issues.sync_status`: `pending_translate` chưa được xem là trạng thái syncable trong code Lite hiện tại.

```
1. Trigger: issue trong CIS có sync_status thuộc nhóm syncable (`ingested`, `pending_review`, `approved`, `update_pending`, `synced`)

2. Lấy dữ liệu:
   ├── project_id → jira_project_key
   ├── fields_json → lấy canonical effective values
   └── jira sync modal override → dùng payload đã chỉnh; các field có giá trị được lưu vào fields_json.<field>.jira

3. Build Jira payload:
   ├── project_key: jira_project_key
   ├── issue_type: từ mapping_rules theo canonical value
   ├── summary: canonical effective summary hoặc override trong modal
   ├── description: canonical effective description hoặc override trong modal
   ├── priority/status/assignee/due_date: canonical effective value qua mapping/Jira config
   └── labels/components/fix_versions/worklogs: chưa nằm trong issue payload v1

4. Gọi Jira API:
   ├── POST /rest/api/3/issue (tạo mới)
   └── PUT /rest/api/3/issue/WEC1-789 (update)

5. Cập nhật CIS:
   ├── UPDATE issues: jira_issue_key, sync_status = 'synced', last_synced_at
   └── UPDATE issues.fields_json: status.jira = mapped_status

6. Ghi sync_journal: direction_from = 'cis', direction_to = 'jira', action = 'create' | 'update', status = 'success'
```

---

## Flow dự kiến: CIS → Backlog (sync ngược)

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
