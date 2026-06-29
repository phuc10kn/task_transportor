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
POST  /api/v1/projects/:projectId/sync/enable
POST  /api/v1/projects/:projectId/sync/disable

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

GET  /api/v1/mapping-rules
POST /api/v1/mapping-rules/:ruleId/approve
POST /api/v1/mapping-rules/:ruleId/reject

GET  /api/v1/anomalies
GET  /api/v1/anomalies/:anomalyId
POST /api/v1/anomalies/:anomalyId/ignore
POST /api/v1/anomalies/:anomalyId/resolve

POST /api/v1/projects/:projectId/backlog/pull
POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull

POST /api/v1/issues/:issueId/dry-run/jira
POST /api/v1/issues/:issueId/sync/jira

GET  /api/v1/sync-jobs
GET  /api/v1/sync-jobs/:jobId
POST /api/v1/sync-jobs/:jobId/retry
POST /api/v1/sync-jobs/:jobId/cancel
GET  /api/v1/sync-journal
GET  /api/v1/issues/:issueId/sync-journal

GET  /api/v1/issues/:issueId/attachments
GET  /api/v1/attachments/:attachmentId/download
POST /api/v1/attachments/:attachmentId/retry-download
```

Endpoint có thể để Medium nếu Lite cần giảm scope:

```text
POST /webhooks/backlog
POST /webhooks/jira
POST /api/v1/mapping-rules/bulk-approve
POST /api/v1/projects/:projectId/jira/pull
POST /api/v1/projects/:projectId/jira/issues/:jiraIssueKey/pull
POST /api/v1/attachments/:attachmentId/retry-sync
```

## Admin UI bắt buộc

- Login.
- Dashboard health tối thiểu.
- Project list/detail/config cơ bản.
- Issue list theo project, status, text search cơ bản nếu làm được trong SQLite.
- Issue detail hiển thị song song Backlog original tiếng Nhật, AI draft/reviewed tiếng Việt, comments, attachments metadata/status, mapping/anomaly/sync state liên quan.
- Translation review.
- Mapping rules/approval thủ công.
- Anomaly list/detail tối thiểu.
- Sync jobs.
- Sync journal.
- Dry-run Jira result.

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
