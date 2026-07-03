# Flow examples

File này áp dụng modular monolith vào các flow thật của dự án.

## Backlog manual pull -> CIS

### Trigger

```text
POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull
POST /api/v1/projects/:projectId/backlog/pull
```

### Boundary đúng

```text
Backlog controller
  -> BacklogApi
    -> Backlog application use case
      -> BacklogClient
      -> Backlog normalizer
      -> SyncApi/enqueue hoặc chạy manual_pull theo contract hiện tại
      -> CisApi/upsert issue nếu use case cần ghi CIS
```

### Luật kiến trúc

- Job dùng `direction_from = backlog`, `direction_to = cis`.
- Manual pull/webhook/scheduled pull sau này dùng chung normalizer.
- Inbound không tự tạo translation queue trong Lite.
- Ingest issue/comment/attachment vào CIS, ghi `sync_journal`.
- Attachment download Backlog -> CIS có thể chạy inline trong job ingest Lite.

### Sai cần tránh

```text
Backlog controller -> SyncApi trực tiếp
Backlog adapter -> UPDATE issues không qua CIS use case
Manual pull dùng normalizer khác webhook
```

## Translation request/review

### Trigger

```text
POST /api/v1/translations/issues/:issueId/translate
POST /api/v1/translation-queue/:queueId/approve
POST /api/v1/translation-queue/:queueId/manual-edit
```

### Boundary đúng

```text
Translation controller
  -> TranslationApi
    -> Translation application
      -> collect context
      -> TranslationAdapter
      -> translation_queue write
      -> audit/journal

Approve + save
  -> TranslationApi approve/manual edit
  -> CisApi.applyReviewedIssueTranslation(...)
```

### Luật kiến trúc

- Translation sở hữu queue/review lifecycle.
- CIS sở hữu canonical issue update.
- AI transport nằm ở `src/infrastructure/ai`.
- Translation không tự gọi `fetch`, `spawn`, `child_process`.
- Translation không tự `UPDATE issues`.

### Điểm Lite hiện tại

Issue Editor direct translate gọi provider trong request hiện tại, không enqueue `sync_jobs`, nhưng vẫn lưu draft/review vào `translation_queue`.

Issue canonical sync từ Issue Editor không còn bị chặn trực tiếp bằng `TRANSLATION_REVIEW_REQUIRED`; tuy vậy `issues.sync_status = pending_translate` vẫn chưa syncable theo sync-state gate hiện tại.

## Issue Editor canonical edit

### Trigger

```text
GET /api/v1/issues/:issueId/editor
PATCH /api/v1/issues/:issueId
```

### Boundary đúng

```text
Cis controller
  -> CisApi
    -> Cis application
      -> read/write fields_json.*.cis
      -> create revision if needed
      -> write journal/audit
```

### Luật kiến trúc

- Admin edit không sửa `fields_json.*.backlog` hoặc `fields_json.*.jira`.
- Canonical edit ghi vào `fields_json.*.cis`.
- Nếu field ảnh hưởng Jira payload đổi sau sync/approve, issue có thể về `update_pending`.
- Dry-run cũ phải stale nếu canonical hash đổi.

## Jira dry-run

### Trigger

```text
POST /api/v1/issues/:issueId/dry-run/jira
```

### Boundary đúng

```text
Jira controller
  -> JiraApi
    -> Jira application dry-run
      -> read issue snapshot (Tier 3 allowlist hoặc future CisApi snapshot)
      -> MappingApi for approved mappings
      -> AnomalyApi/pre-check if needed
      -> build Jira payload
      -> write dry-run journal
```

### Luật kiến trúc

- Dry-run không gọi Jira API thật.
- Dry-run build payload từ canonical effective values.
- Required mapping, Jira config, project sync, critical anomaly phải được validate.
- Kết quả dry-run có `canonical_hash`.

## CIS -> Jira sync thật

### Trigger

```text
POST /api/v1/issues/:issueId/sync/jira
sync_jobs job_type = push_issue
```

### Boundary đúng

```text
Jira sync use case / worker
  -> validate dry-run freshness
  -> validate mapping/anomaly/config
  -> JiraClient create/update
  -> CisApi.saveIssueJiraSyncResult(...)
  -> SyncApi/journal update
```

### Luật kiến trúc

- Nếu pre-check fail, không gọi Jira API.
- Nếu Jira API success, cập nhật `issues.jira_issue_key`, `issues.sync_status`, `last_synced_at` qua CIS owner.
- Jira module không tự `UPDATE issues`.
- Mỗi attempt ghi `sync_journal`.
- Idempotency: nếu có `jira_issue_key` thì update; nếu chưa có thì search/link/create theo rule.

## Dashboard summary

### Boundary đúng

```text
DashboardApi
  -> DashboardRepository
    -> SELECT/COUNT cross-table read-only (Tier 2 allowlist)
```

### Luật kiến trúc

- Dashboard được đọc chéo bảng để reporting/operations.
- Dashboard không mutate `issues`, `translation_queue`, `sync_jobs`, `anomaly_log`, `projects`.
- Nếu query trở nên phức tạp hoặc schema coupling gây lỗi lặp lại, chuyển sang read model/projection.

## Future Jira webhook -> CIS

### Boundary đúng

```text
Jira webhook route
  -> verify signature
  -> store raw webhook_events
  -> enqueue webhook_ingest direction_from=jira direction_to=cis
  -> return fast

Worker
  -> Jira normalizer
  -> CisApi/upsert Jira snapshot
  -> journal
```

### Luật kiến trúc

- Webhook không xử lý nặng.
- Jira webhook/manual pull dùng chung normalizer.
- Jira inbound update vào CIS trước, không sync ngược Backlog trực tiếp.

