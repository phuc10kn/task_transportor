# API Contract — Admin UI và Codex operation

## Mục tiêu

File này chốt contract API MVP cho Admin UI và cho Codex thao tác hệ thống qua ngôn ngữ tự nhiên.

Nguyên tắc:

- API version dùng `/api/v1/...`.
- Webhook endpoint giữ ngoài version: `/webhooks/backlog`, `/webhooks/jira`.
- Response success luôn có `data`.
- List response có thêm `meta`.
- Error response có code, details và correlation id.
- Codex được gọi read-only trực tiếp nếu đã auth; action ghi/sync/approve phải hỏi user confirm trước.

## Response envelope

Detail/action success:

```json
{
  "data": {
    "id": "issue_123",
    "status": "pending_review"
  }
}
```

List success:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 50,
    "total": 0,
    "total_pages": 0
  }
}
```

## Error format

```json
{
  "error": {
    "code": "MAPPING_REQUIRED",
    "message": "Issue cannot sync because required mapping is missing.",
    "details": {
      "mapping_type": "issue_type",
      "from_value": "機能改善"
    },
    "correlation_id": "req_01HY0000000000000000000000"
  }
}
```

Yêu cầu:

- Mọi request có `correlation_id`.
- Error message dùng để hiển thị cho admin.
- `details` dùng cho UI/Codex giải thích nguyên nhân và đề xuất bước tiếp theo.

## Auth

MVP dùng Bearer token header.

```http
Authorization: Bearer <jwt>
```

Endpoints auth:

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Ghi chú:

- JWT ký bằng `JWT_SECRET`.
- Token hết hạn trả `401`.
- User không đủ quyền trả `403`.
- MVP chỉ có admin, chưa cần role phức tạp.

## Pagination, filter, sort

Pagination:

```text
?page=1&page_size=50
```

Filter/sort dùng query params phẳng:

```text
GET /api/v1/issues?project_id=wecsy-main&status=pending_review&q=login&sort=-updated_at&page=1&page_size=50
```

Sort convention:

- `sort=created_at` tăng dần.
- `sort=-created_at` giảm dần.

## Idempotency

MVP không bắt buộc client gửi `Idempotency-Key`.

Backend tự dedupe action ghi theo issue/action/job context, ví dụ:

- `sync_jobs.dedupe_key`
- issue id + action name + target system
- queue id + action name

Nếu client gửi `Idempotency-Key`, backend có thể ghi nhận sau MVP, nhưng không phải contract bắt buộc.

## Reason cho action ghi

Không action nào bắt buộc `reason` trong MVP.

Tuy vậy các endpoint action ghi nên nhận optional:

```json
{
  "reason": "Admin confirmed after checking customer context."
}
```

Nếu có `reason`, ghi vào journal/audit.

## Codex operation safety

Codex có thể gọi read-only endpoint trực tiếp nếu đã auth:

- list/get issue
- list/get journal
- list/get anomaly
- list/get mapping
- list/get translation queue
- dashboard summary

Codex phải hỏi user confirm trước khi gọi action ghi:

- approve/reject translation
- approve/reject mapping
- force approve issue
- mark duplicate
- ignore/resolve anomaly
- retry/cancel job
- sync Jira thật
- enable/disable project sync
- thay đổi project config

Dry-run:

- Dry-run không ghi Jira thật nhưng vẫn có thể tạo journal/job tùy implementation.
- Codex nên hỏi confirm nhẹ trước khi tạo dry-run nếu action đó ghi state.

## Audit

Action ghi quan trọng phải ghi `sync_journal` hoặc audit tương đương:

- translation approve/reject/retranslate/manual edit
- mapping approve/reject/bulk approve
- force approve issue
- mark duplicate
- anomaly ignore/resolve
- sync dry-run
- sync Jira thật
- retry/cancel job
- project sync enable/disable

Journal/audit nên ghi:

- `executed_by`
- action
- target id
- old/new status nếu có
- optional reason
- correlation id nếu có

## Endpoint groups MVP

### Auth

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Dashboard

```text
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/alerts
```

### Projects

```text
GET   /api/v1/projects
POST  /api/v1/projects
GET   /api/v1/projects/:projectId
PATCH /api/v1/projects/:projectId
POST  /api/v1/projects/:projectId/sync/enable
POST  /api/v1/projects/:projectId/sync/disable
```

### Issues

```text
GET  /api/v1/issues
GET  /api/v1/issues/:issueId
GET  /api/v1/projects/:projectId/issues
POST /api/v1/issues/:issueId/force-approve
POST /api/v1/issues/:issueId/mark-duplicate
```

### Translation review

```text
GET  /api/v1/translation-queue
GET  /api/v1/translation-queue/:queueId
POST /api/v1/translation-queue/:queueId/approve
POST /api/v1/translation-queue/:queueId/reject
POST /api/v1/translation-queue/:queueId/retranslate
POST /api/v1/translation-queue/:queueId/manual-edit
```

### Mapping approval

```text
GET  /api/v1/mapping-rules
POST /api/v1/mapping-rules/:ruleId/approve
POST /api/v1/mapping-rules/:ruleId/reject
POST /api/v1/mapping-rules/bulk-approve
```

### Anomalies

```text
GET  /api/v1/anomalies
GET  /api/v1/anomalies/:anomalyId
POST /api/v1/anomalies/:anomalyId/ignore
POST /api/v1/anomalies/:anomalyId/resolve
```

### CIS inbound / Pull into CIS

```text
POST /api/v1/projects/:projectId/backlog/pull
POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull
POST /api/v1/projects/:projectId/jira/pull
POST /api/v1/projects/:projectId/jira/issues/:jiraIssueKey/pull
```

### CIS outbound / Push from CIS

```text
POST /api/v1/issues/:issueId/dry-run/jira
POST /api/v1/issues/:issueId/sync/jira
```

### Sync jobs / journal

```text
GET  /api/v1/sync-jobs
GET  /api/v1/sync-jobs/:jobId
POST /api/v1/sync-jobs/:jobId/retry
POST /api/v1/sync-jobs/:jobId/cancel
GET  /api/v1/sync-journal
GET  /api/v1/issues/:issueId/sync-journal
```

### Attachments

```text
GET  /api/v1/issues/:issueId/attachments
GET  /api/v1/attachments/:attachmentId/download
POST /api/v1/attachments/:attachmentId/retry-download
POST /api/v1/attachments/:attachmentId/retry-sync
```

## Dry-run Jira response

Dry-run response phải đủ để Admin UI/Codex giải thích vì sao sync được hoặc chưa được.

```json
{
  "data": {
    "issue_id": "issue_123",
    "target": "jira",
    "mode": "dry_run",
    "can_sync": false,
    "payload": {
      "project": { "key": "WEC1" },
      "summary": "[ONE-123] Login error",
      "description": "..."
    },
    "validation": {
      "missing_required_mapping": [
        {
          "mapping_type": "issue_type",
          "from_value": "機能改善"
        }
      ],
      "attachments": [
        {
          "id": "att_1",
          "status": "pending_download"
        }
      ],
      "warnings": []
    }
  }
}
```

Nếu `can_sync = false`, endpoint sync thật phải không gọi Jira API và trả lỗi có code rõ ràng.

## HTTP status convention

| Status | Khi nào dùng |
| --- | --- |
| `200` | GET/action sync hoàn tất ngay. |
| `201` | Tạo resource mới. |
| `202` | Đã nhận action và tạo async job. |
| `400` | Request body/query invalid. |
| `401` | Chưa auth/token hết hạn. |
| `403` | Auth rồi nhưng không được phép hoặc policy chặn. |
| `404` | Không tìm thấy resource. |
| `409` | Conflict/idempotency/mapping state không phù hợp. |
| `422` | Validation domain fail, ví dụ thiếu mapping required. |
| `500` | Lỗi server không xử lý được. |
