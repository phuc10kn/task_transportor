# Lite - API và Admin UI

## API contract

Lite dùng `/api/v1` cho Admin API. Nếu bật webhook optional hoặc sang Medium, webhook giữ ngoài version.

Response success:

```json
{ "data": {} }
```

List response:

```json
{ "data": [], "meta": { "page": 1, "page_size": 50, "total": 0, "total_pages": 0 } }
```

Error response:

```json
{
  "error": {
    "code": "MAPPING_REQUIRED",
    "message": "Issue cannot sync because required mapping is missing.",
    "details": {},
    "correlation_id": "req_xxx"
  }
}
```

## Auth

- Simple JWT auth với email + password.
- Password hash bằng bcrypt/argon2 hoặc thư viện tương đương.
- Không lưu plain text password.
- JWT dùng Bearer token trong `Authorization` header.
- Token hết hạn trả `401`.
- Lite chỉ cần admin, chưa cần role phức tạp.

## Endpoint bắt buộc

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET  /api/v1/dashboard/summary
GET  /api/v1/dashboard/alerts

GET   /api/v1/projects
POST  /api/v1/projects
GET   /api/v1/projects/:projectId
PATCH /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId
POST  /api/v1/projects/:projectId/sync/enable
POST  /api/v1/projects/:projectId/sync/disable
POST  /api/v1/projects/:projectId/cis/mapping-values/sync

GET  /api/v1/issues
GET  /api/v1/issues/:issueId
GET  /api/v1/projects/:projectId/issues
POST /api/v1/issues/:issueId/force-approve
POST /api/v1/issues/:issueId/mark-duplicate

GET  /api/v1/translation-queue
GET  /api/v1/translation-queue/:queueId
POST /api/v1/translation-queue/:queueId/approve
POST /api/v1/translation-queue/:queueId/reject
POST /api/v1/translation-queue/:queueId/retranslate
POST /api/v1/translation-queue/:queueId/manual-edit

GET  /api/v1/mapping-settings
GET  /api/v1/mapping-rules
POST /api/v1/mapping-rules
GET  /api/v1/mapping-rules/:ruleId
PATCH /api/v1/mapping-rules/:ruleId
DELETE /api/v1/mapping-rules/:ruleId
POST /api/v1/mapping-rules/:ruleId/approve
POST /api/v1/mapping-rules/:ruleId/reject

GET  /api/v1/anomalies
POST /api/v1/anomalies
GET  /api/v1/anomalies/:anomalyId
POST /api/v1/anomalies/:anomalyId/ignore
POST /api/v1/anomalies/:anomalyId/resolve

POST /api/v1/projects/:projectId/backlog/pull
POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull
POST /api/v1/projects/:projectId/backlog/mapping-values/pull
POST /api/v1/projects/:projectId/jira/mapping-values/pull

GET  /api/v1/issues/:issueId/editor
PATCH /api/v1/issues/:issueId
GET  /api/v1/issues/:issueId/history
GET  /api/v1/issues/:issueId/worklogs
POST /api/v1/issues/:issueId/translations/translate
POST /api/v1/issues/:issueId/translations/:queueId/translate
POST /api/v1/issues/:issueId/dry-run/jira
POST /api/v1/issues/:issueId/sync/jira

GET  /api/v1/sync-jobs
POST /api/v1/sync-jobs
GET  /api/v1/sync-jobs/:jobId
POST /api/v1/sync-jobs/:jobId/retry
POST /api/v1/sync-jobs/:jobId/cancel
GET  /api/v1/sync-journal
GET  /api/v1/issues/:issueId/sync-journal

GET  /api/v1/issues/:issueId/attachments
POST /api/v1/attachments/:attachmentId/retry-download
```

Issue Editor API:

- `GET /issues/:issueId/editor` trả canonical effective values và source theo `cis/backlog/jira`.
- `PATCH /issues/:issueId` chỉ ghi vào `fields_json.*.cis`, không sửa source branch.
- `GET /issues/:issueId/history` trả revision và manual edit journal liên quan.
- `GET /issues/:issueId/worklogs` trả collection read-only, không phải canonical field.
- `POST /issues/:issueId/translations/translate` tạo/translate ngay các issue target còn cần dịch (`summary`, `description`) bằng Backlog source hiện tại, không enqueue `sync_jobs`.
- `POST /issues/:issueId/translations/:queueId/translate` dịch lại một item cụ thể trong Issue Editor nếu item đó thuộc issue và target hợp lệ.
- Issue translation source lấy từ `fields_json.<target_field>.backlog`, không fallback. UI phải để source/translated text rỗng nếu Backlog source rỗng hoặc queue item stale.

Dry-run/sync Jira sau Issue Editor:

- Build payload từ canonical effective values.
- UI chỉ hiển thị một nút `Jira sync`; mở modal sẽ chạy dry-run, duplicate các field sắp sync và cho admin chỉnh trước khi sync.
- `POST /issues/:issueId/sync/jira` có thể nhận payload override từ modal. Sync job dùng payload override đó; các draft field có giá trị được lưu vào `fields_json.<field>.jira` trước khi enqueue sync.
- Không đưa `labels/components/fix_versions/worklogs` vào issue payload v1.
- Không dùng translation queue/review làm gate riêng chặn issue sync; vẫn phải tôn trọng `issues.sync_status`. Code Lite hiện tại không sync khi issue còn `pending_translate`.
- Không check/warning attachment trong issue dry-run cho tới khi attachment outbound flow được nối.
- Sync thật yêu cầu dry-run thành công mới nhất khớp `canonical_hash`; nếu không trả `DRY_RUN_STALE`.

`retry-download` dùng cho chiều Backlog/Jira -> CIS storage. Endpoint này chạy trực tiếp, cập nhật `download_status`, `stored_path`, `sha256`, `error_message` và không tạo thêm `sync_jobs`.

Project config API phải nhận và trả về các field translation chính:

```json
{
  "translation_provider": "codex_exec",
  "source_language": "ja",
  "target_language": "vi",
  "translation_glossary_json": [
    { "source": "予約", "target": "đặt chỗ" },
    { "source": "管理画面", "target": "màn hình quản trị" }
  ],
  "auto_translate": false,
  "require_translation_review": false
}
```

`translation_glossary_json` là glossary riêng theo project, không phải global config. Admin UI nên cho phép xem/sửa field này trong Project Config để kiểm soát thuật ngữ Nhật -> Việt.

Endpoint chưa có trong code Lite hiện tại, để Medium/phase sau:

```text
POST /webhooks/backlog
POST /webhooks/jira
POST /api/v1/mapping-rules/bulk-approve
POST /api/v1/projects/:projectId/jira/pull
POST /api/v1/projects/:projectId/jira/issues/:jiraIssueKey/pull
GET  /api/v1/attachments/:attachmentId/download
POST /api/v1/attachments/:attachmentId/retry-sync
```

`retry-sync` dùng cho chiều CIS -> hệ thống đích như Jira, khác với `retry-download`.

## Admin UI bắt buộc

Ghi chú IE hiện tại: Admin UI mở Issue Editor trực tiếp từ Issue list. Issue Editor hiển thị/sửa canonical CIS fields, source `cis/backlog/jira`, worklogs read-only và trạng thái cần dry-run lại. Sync Jira từ UI phải dựa trên dry-run mới nhất; nếu API trả `DRY_RUN_STALE`, UI yêu cầu admin dry-run lại.

Ghi chú UI hiện tại:

- Issue list mở thẳng `Issue Editor`.
- Màn chính Issue Editor có các block riêng: `CIS CANONICAL`, `Translations`, `Backlog sync`, `Jira sync`, `Overview`, `Source data`, `History`.
- `Translations` trên màn chính chỉ là nút mở modal. Modal xử lý translate, retranslate, edit reviewed text, `Approve + save` và `Reject`.
- `Jira sync` trên màn chính chỉ là nút mở modal. Modal tự chạy dry-run, hiển thị payload sắp update, cho chỉnh các field Jira target rồi sync.
- Project Config disable `Pull whole project` ở FE; vận hành UI hiện ưu tiên `Pull one issue` và `Resync from Backlog` trong Issue Editor.

- Login.
- Dashboard health tối thiểu.
- Project list/detail/config cơ bản.
- Project Config hiển thị và cho chỉnh translation provider, source/target language, auto-translate, require review và `translation_glossary_json`.
- Issue list theo project, status, text search cơ bản nếu làm được trong SQLite.
- Issue Editor là màn chính của issue. Issue detail nếu còn tồn tại chỉ là legacy/read-only view cho Backlog original, draft/reviewed, comments, attachments metadata/status và state liên quan.
- Translation review.
- Mapping rules/approval thủ công.
- Anomaly list/detail tối thiểu.
- Sync jobs.
- Sync journal.
- Jira sync modal with dry-run result.

Dashboard Lite tối thiểu hiển thị:

- Số pull jobs pending/failed.
- Số translation pending/ai_draft.
- Số issue pending mapping.
- Số sync job failed.
- Số anomaly open.

## Audit và logging

Lite phải có correlation id:

- API request.
- Pull request/job.
- Sync job payload/journal.
- Error response.

Không log secret:

- `X-Webhook-Token` nếu bật webhook optional/Medium.
- Jira query token sau này.
- Authorization header.
- Backlog/Jira API token.
- `CODEX_EXEC_COMMAND` nếu command có chứa tham số nhạy cảm.
- OpenAI API key nếu bật provider fallback `openai_api`.

Retention theo quyết định MVP:

- `webhook_events`: 3 tháng nếu tạo sẵn hoặc bật webhook ở Medium.
- `sync_journal`: 3 tháng.
- `anomaly_log`: 3 tháng.

Lite chỉ cần document hoặc chuẩn bị cleanup command; chưa cần tự động cleanup nếu muốn giữ scope nhỏ.

Backup:

- Lite cần document hướng dẫn backup SQLite.
- Chưa cần backup tự động định kỳ.
