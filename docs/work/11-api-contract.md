# API Contract — Admin UI và Codex operation

## Mục tiêu

File này chốt contract API MVP cho Admin UI và cho Codex thao tác hệ thống qua ngôn ngữ tự nhiên.

Nguyên tắc:

- API version dùng `/api/v1/...`.
- Webhook endpoint nếu bật ở Medium/phase sau sẽ giữ ngoài version: `/webhooks/backlog`, `/webhooks/jira`. Code Lite hiện tại chưa mount webhook routes.
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
    "sync_status": "pending_review"
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
GET /api/v1/issues?project_id=wecsy-main&sync_status=pending_review&q=login&sort=-updated_at&page=1&page_size=50
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
- old/new sync_status nếu có
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
DELETE /api/v1/projects/:projectId
POST  /api/v1/projects/:projectId/sync/enable
POST  /api/v1/projects/:projectId/sync/disable
POST  /api/v1/projects/:projectId/cis/mapping-values/sync
```

Project create/update payload dùng cho `POST /api/v1/projects` và `PATCH /api/v1/projects/:projectId` có thể chứa các field translation sau:

```json
{
  "translation_provider": "codex_exec",
  "translation_model": null,
  "translation_command_profile": null,
  "source_language": "ja",
  "target_language": "vi",
  "translation_glossary_json": [
    { "source": "予約", "target": "đặt chỗ" },
    { "source": "管理画面", "target": "màn hình quản trị", "notes": "Dùng cho admin UI" }
  ],
  "auto_translate": false,
  "require_translation_review": false
}
```

`translation_glossary_json` là glossary riêng theo project. Backend validate field này là mảng object, mỗi entry bắt buộc có `source` và `target`; `notes` là optional. Không lưu secret thật trong project payload.

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
POST /api/v1/translations/issues/:issueId/translate
POST /api/v1/translations/issues/:issueId/items/:queueId/translate
GET  /api/v1/translation-queue
GET  /api/v1/translation-queue/:queueId
POST /api/v1/translation-queue/:queueId/approve
POST /api/v1/translation-queue/:queueId/reject
POST /api/v1/translation-queue/:queueId/retranslate
POST /api/v1/translation-queue/:queueId/manual-edit
```

`POST /translations/issues/:issueId/translate` tạo hoặc dịch ngay các target issue hiện tại (`summary`, `description`) bằng Backlog source hiện tại. Endpoint này thuộc module Translation, gọi provider trong request hiện tại, không enqueue `sync_jobs`, nhưng vẫn lưu draft/review vào `translation_queue`.

`POST /translations/issues/:issueId/items/:queueId/translate` dịch lại một queue item cụ thể thuộc issue đó.

### Mapping approval

```text
GET  /api/v1/mapping-settings
GET  /api/v1/mapping-rules
POST /api/v1/mapping-rules
GET  /api/v1/mapping-rules/:ruleId
PATCH /api/v1/mapping-rules/:ruleId
DELETE /api/v1/mapping-rules/:ruleId
POST /api/v1/mapping-rules/:ruleId/approve
POST /api/v1/mapping-rules/:ruleId/reject
```

`GET /api/v1/mapping-settings` phục vụ màn Mapping Settings. Response chia rõ:

- `flows.systems_to_cis`: các giá trị field đã kéo từ hệ nguồn trong `issues.fields_json` để map vào canonical CIS.
- `flows.cis_to_system`: các canonical CIS field/value nên map hoặc có thể map ra hệ đích.
- `mapping_types`: catalog field mapping của CIS, trong đó Lite bắt buộc `issue_type`, `status`, `priority` cho Jira; `user`, `component` là optional.
- Với `mapping_type = user`, CIS xác định project user bằng email trong `cis_mapping_values_json.user`. Khi sync Jira, assignee/reporter là field sử dụng mapping user email sang giá trị hệ đích, ví dụ Jira `accountId`.
- Dropdown `System value` lấy từ config project theo system: `backlog_mapping_values_json` cho Backlog và `jira_mapping_values_json` cho Jira; value đã thấy trong issue/rule cũ chỉ là fallback để không mất dữ liệu.
- Dropdown `CIS value` lấy từ `cis_mapping_values_json` của project. Khi project muốn dùng Jira hoặc Backlog làm hệ giá trị đích cuối, Admin UI gọi action sync riêng để cập nhật `cis_mapping_values_json` theo chính danh sách value của target system.

Màn Mapping có action kéo field/value theo system đang chọn:

```text
POST /api/v1/projects/:projectId/backlog/mapping-values/pull
POST /api/v1/projects/:projectId/jira/mapping-values/pull
POST /api/v1/projects/:projectId/cis/mapping-values/sync
```

Hai action pull Backlog/Jira chỉ cập nhật config value list của system tương ứng trong project, chưa tạo/approve mapping rule và không tự cập nhật CIS.

Action sync CIS nhận body:

```json
{ "target_system": "jira" }
```

`target_system` tạm thời nhận `jira` hoặc `backlog`. Action này pull mapping field từ target system, cập nhật config của target system và thay `cis_mapping_values_json` bằng danh sách value vừa pull. Nếu field trong CIS đã có value cũ và bị thay, response trả `warnings` để Admin UI cảnh báo người dùng.

### Anomalies

```text
GET  /api/v1/anomalies
POST /api/v1/anomalies
GET  /api/v1/anomalies/:anomalyId
POST /api/v1/anomalies/:anomalyId/ignore
POST /api/v1/anomalies/:anomalyId/resolve
```

### CIS inbound / Pull into CIS

```text
POST /api/v1/projects/:projectId/backlog/pull
POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull
```

Với Admin UI Lite, `POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull` vẫn tạo `sync_jobs` loại `manual_pull` để có audit/journal, nhưng request sẽ xử lý ngay job đó để issue được kéo vào CIS trong cùng thao tác. `POST /api/v1/projects/:projectId/backlog/pull` vẫn chỉ enqueue danh sách job vì có thể kéo nhiều issue.

Code Lite hiện tại chưa có endpoint Jira inbound/manual pull như `POST /api/v1/projects/:projectId/jira/pull` hoặc `POST /api/v1/projects/:projectId/jira/issues/:jiraIssueKey/pull`. Jira hiện có trong Lite ở hai phần: mapping-values pull và outbound dry-run/sync từ CIS sang Jira.

### CIS outbound / Push from CIS

```text
GET  /api/v1/issues/:issueId/editor
PATCH /api/v1/issues/:issueId
POST /api/v1/issues/:issueId/translations/translate          (compat alias -> Translation)
POST /api/v1/issues/:issueId/translations/:queueId/translate   (compat alias -> Translation)
GET  /api/v1/issues/:issueId/history
GET  /api/v1/issues/:issueId/worklogs
POST /api/v1/issues/:issueId/dry-run/jira
POST /api/v1/issues/:issueId/sync/jira
```

`GET /issues/:issueId/editor` trả issue core, canonical effective values, source values theo `cis/backlog/jira`, `field_meta`, `assignee_meta`, worklog summary và sync summary.

Hai route `POST /issues/:issueId/translations/*` giữ lại để tương thích URL cũ; implementation gọi `TranslationApi`. Route canonical nằm ở module Translation (`POST /translations/issues/:issueId/translate` và `POST /translations/issues/:issueId/items/:queueId/translate`).

`PATCH /issues/:issueId` chỉ cho sửa canonical fields:

- `summary`
- `description`
- `issue_type`
- `priority`
- business `status`
- `assignee`
- `due_date`
- `assignee_meta.jira_account_id` nếu đi cùng `assignee`

Endpoint này chỉ ghi vào `fields_json.*.cis`, không ghi đè `fields_json.*.backlog` hoặc `fields_json.*.jira`.

`labels`, `components`, `fix_versions`, raw custom fields và các `*_meta` không cần thiết không nằm trong Issue Editor v1.

### Sync jobs / journal

```text
GET  /api/v1/sync-jobs
POST /api/v1/sync-jobs
GET  /api/v1/sync-jobs/:jobId
POST /api/v1/sync-jobs/:jobId/retry
POST /api/v1/sync-jobs/:jobId/cancel
GET  /api/v1/sync-journal
GET  /api/v1/issues/:issueId/sync-journal
```

### Attachments

```text
GET  /api/v1/issues/:issueId/attachments
POST /api/v1/attachments/:attachmentId/retry-download
```

`retry-download` dùng cho chiều hệ thống nguồn -> CIS storage. Endpoint này chạy trực tiếp, cập nhật `download_status`, `stored_path`, `sha256`, `size_bytes`, `error_message` và không tạo thêm `sync_jobs`.

Code Lite hiện tại chưa có endpoint download file trực tiếp từ Admin API và chưa có `retry-sync` attachment outbound. Attachment outbound sang Jira sẽ có flow/pre-check riêng khi được nối vào code.

## Dry-run Jira response

Ghi chú: với Issue Editor, contract hiện hành là phần "Dry-run Jira response - cập nhật IE-02" bên dưới. Ví dụ legacy trong section này chỉ còn giá trị tham chiếu lịch sử.

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

### Dry-run Jira response - cập nhật IE-02

Trong Issue Editor flow, dry-run Jira build payload từ canonical effective values của CIS và không check translation queue bằng gate riêng. API vẫn kiểm tra `issues.sync_status`; theo code Lite hiện tại `pending_translate`, `syncing`, `conflict` và `archived` không sync được.

```json
{
  "data": {
    "issue_id": "issue_123",
    "target": "jira",
    "mode": "dry_run",
    "can_sync": true,
    "canonical_hash": "sha256:...",
    "field_sources": {
      "summary": "cis",
      "description": "backlog",
      "issue_type": "cis",
      "priority": "cis",
      "status": "cis",
      "assignee": "cis",
      "due_date": "cis"
    },
    "excluded_collections": ["worklogs"],
    "stale": false,
    "payload": {
      "operation": "create",
      "jira_issue_key": null,
      "fields": {
        "project": { "key": "DMP" },
        "issuetype": { "name": "Task" },
        "summary": "Canonical summary",
        "description": "Canonical plain text",
        "priority": { "name": "Medium" },
        "assignee": { "accountId": "jira-account-id" },
        "duedate": "2026-07-31"
      },
      "transition_preview": {
        "status": "Done"
      }
    },
    "validation": {
      "errors": [],
      "missing_required_mapping": [],
      "blocking_anomalies": []
    },
    "warnings": []
  }
}
```

Payload issue Jira v1 không đưa `labels`, `components`, `fix_versions` hoặc `worklogs`.

Attachment outbound chưa nối vào Issue Editor dry-run/sync, nên issue dry-run không check hoặc warning attachment. Attachment sync sẽ có contract riêng khi được implement.

Nếu sync thật được gọi khi chưa có dry-run thành công khớp `canonical_hash` hiện tại, API trả `422 DRY_RUN_STALE` và không enqueue job Jira.

`TRANSLATION_REVIEW_REQUIRED` không áp dụng cho canonical Issue Editor -> Jira sync. Translation Review vẫn là workflow riêng.

Comment sync vẫn cần `content_translated`/reviewed text trước khi được đẩy sang Jira; rule bỏ `TRANSLATION_REVIEW_REQUIRED` chỉ áp dụng cho issue canonical sync từ Issue Editor.

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
