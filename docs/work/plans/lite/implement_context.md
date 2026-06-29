# Lite - Implement Context

File này là context tổng hợp để bắt đầu implement phiên bản Lite. Nội dung được chọn lọc từ:

- `docs/work/implement-interview.md`
- `docs/work/plans/lite/*`
- `docs/work/plans/architecture/*`

Mục tiêu của file này là đủ để một lượt implement Lite có thể bắt đầu mà không phải đọc lại toàn bộ interview dài. Khi có mâu thuẫn, ưu tiên theo thứ tự:

1. Quyết định mới trong `docs/work/plans/lite/*`.
2. Architecture guide trong `docs/work/plans/architecture/*`.
3. Quyết định gốc trong `docs/work/implement-interview.md`.
4. Spec nền trong `docs/work/01-*.md` đến `12-*.md`.

## 1. Product model không đổi

Lite vẫn đi theo model chung:

```text
System -> CIS -> System
```

Trong Lite:

```text
Backlog manual pull / scheduled pull
  -> CIS
  -> codex_exec translation
  -> Human review
  -> Dry-run
  -> CIS -> Jira
```

Lite không cho Backlog gọi Jira trực tiếp. Mọi dữ liệu từ Backlog phải vào CIS trước, được normalize, review, mapping/anomaly pre-check, rồi mới outbound sang Jira.

## 2. Lite khác MVP đầy đủ ở đâu?

`implement-interview.md` chốt MVP gồm 3 luồng:

- Backlog -> CIS
- CIS -> Jira
- Jira -> CIS

Lite là bước nhỏ hơn MVP. Lite chỉ bật:

- Backlog -> CIS bằng manual pull/scheduled pull.
- CIS -> Jira bằng dry-run rồi sync thật.

Lite chưa bật:

- Backlog webhook bắt buộc.
- Jira webhook.
- Jira -> CIS đầy đủ.
- CIS -> Backlog.
- Việt -> Nhật cho dev reply về Backlog.
- Attachment upload/copy sang Jira nếu chọn cắt scope ở Lite.
- AI learning nâng cao.
- Role phức tạp.

Tuy vậy Lite vẫn phải giữ schema/state/module đủ để Medium thêm webhook/Jira inbound mà không rewrite core.

## 3. Architecture cần theo

Hướng kiến trúc: **modular monolith**.

```text
One repository
One Node.js service first
One SQLite database first
Clear module boundaries
```

Module structure chuẩn:

```text
src/
  app.js
  server.js
  config/
  db/
  infrastructure/
  services/
  shared/
  modules/
    <Domain>/
      <Domain>Api.js
      application/
      data/
      domain/
      infrastructure/
      support/
      http/
        controllers/
        requests/
        resources/
```

Rules quan trọng:

- Controller chỉ gọi `<Domain>Api`.
- `<Domain>Api` là public module boundary.
- Business action nằm trong `application/`, đặt tên theo động từ.
- Module khác không import trực tiếp `application/*` hoặc `infrastructure/*` khi module đã có API boundary.
- `src/infrastructure/` chứa shared technical infrastructure.
- `modules/<Domain>/infrastructure/` chứa adapter/repository riêng module.
- `support/` chỉ chứa helper thuần, không I/O.
- `src/shared/` chỉ chứa pure utility, không business logic.
- `src/services/` chỉ dùng cho cross-cutting service thật sự, không làm nơi chứa orchestration nghiệp vụ.

Domain module dự kiến cho Lite:

- `Auth`
- `Projects`
- `Cis`
- `Backlog`
- `Translation`
- `Mapping`
- `Anomaly`
- `Sync`
- `Jira`
- `Dashboard`
- `Attachments` nếu muốn tách riêng khỏi `Cis`

## 4. Runtime

Runtime Lite:

- Node.js CommonJS.
- Express API.
- Một service duy nhất gồm API và worker loop nội bộ.
- Webhook receiver không bắt buộc trong Lite; chỉ optional/reserved cho Medium.
- SQLite bằng `better-sqlite3`.
- Migration SQL file tự quản.
- Auto migrate khi app start.
- Có command `npm run migrate`.
- Có command/script `npm run admin:create`.
- App tự tạo storage directories khi start.

Default storage:

```text
storage/
  db/
    cis.sqlite
  attachments/
  backups/
  logs/
```

Production fail fast nếu thiếu:

- `NODE_ENV`
- `DATABASE_PATH`
- `STORAGE_ROOT`
- `ATTACHMENT_STORAGE_PATH`
- `JWT_SECRET`

Admin bootstrap:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Integration env:

- `CODEX_EXEC_COMMAND` cho translation provider chính.
- `CODEX_EXEC_TIMEOUT_SECONDS`
- `CODEX_EXEC_WORKDIR` nếu cần cố định thư mục chạy.
- `WORKER_ID`
- `WORKER_POLL_INTERVAL_MS`
- `WORKER_LOCK_TIMEOUT_SECONDS`
- `OPENAI_API_KEY` optional nếu bật provider fallback `openai_api`.
- `OPENAI_TRANSLATION_MODEL` optional nếu bật provider fallback `openai_api`.
- Backlog/Jira credentials bằng env riêng, project config chỉ lưu tên biến env.
- `WEBHOOK_VERIFY` reserved cho Medium hoặc webhook optional.

Secret policy:

- Không hard-code credentials.
- Không commit `.env`, `.codex/config.toml`, `storage/`, SQLite DB thật, attachment thật, backup thật.
- Không ghi token/API key/JWT secret vào log, journal hoặc payload debug.

## 5. Project config Lite

Config nguồn:

- JSON seed để bootstrap/import ban đầu.
- SQLite là nguồn chính khi app chạy.
- Admin chỉnh qua UI.

Field tối thiểu:

- `id`
- `name`
- `enabled`
- `sync_enabled`
- `backlog_space_url`
- `backlog_space_key`
- `backlog_project_key`
- `backlog_issue_key_prefix`
- `backlog_webhook_secret` optional/reserved cho Medium
- `backlog_api_key_env`
- `jira_site_url`
- `jira_project_key`
- `jira_email_env`
- `jira_api_token_env`
- `jira_webhook_secret` optional/reserved cho Medium
- `translation_provider`, mặc định Lite là `codex_exec`
- `translation_model` hoặc `translation_command_profile`, tùy provider
- `source_language = "ja"`
- `target_language = "vi"`
- `auto_translate`
- `require_translation_review`
- `require_mapping_approval`
- `mapping_scope = "global_with_project_override"`

Pull config:

- `manual_pull_enabled`
- `scheduled_pull_enabled`
- `scheduled_pull_interval_minutes`
- `last_backlog_pull_at` hoặc bảng `pull_state`
- `pull_updated_since_window_minutes`
- `scheduled_pull_filter_json`

`scheduled_pull_filter_json` mặc định:

```json
{
  "statuses": [],
  "issue_types": [],
  "priorities": [],
  "include_closed": true,
  "include_attachments": "metadata_only",
  "page_size": 100
}
```

Khi `sync_enabled = false`, worker không chạy outbound sync thật cho project đó.

## 6. Database/schema Lite

Bảng bắt buộc:

- `schema_migrations`
- `admin_users` hoặc bảng user tương đương
- `projects`
- `issues`
- `issue_revisions`
- `issue_comments`
- `issue_attachments`
- `translation_queue`
- `mapping_rules`
- `anomaly_log`
- `sync_jobs`
- `sync_journal`
- `pull_state` hoặc field tương đương cho scheduled pull

Optional/reserved cho Medium:

- `webhook_events`

Schema rules:

- `issues.id` là id nội bộ, không dùng Backlog/Jira key làm primary key.
- `issues.fields_json` giữ field-level source tracking.
- `issue_revisions` giữ content history, không ghi đè nội dung cũ.
- `sync_jobs` và `sync_journal` bắt buộc dùng `direction_from` và `direction_to`.
- `mapping_rules` cũng dùng `direction_from` và `direction_to`.
- Không quay lại mapping trực tiếp Backlog -> Jira như hệ cũ.

State bắt buộc:

`issues.status`:

- `ingested`
- `pending_translate`
- `pending_review`
- `approved`
- `syncing`
- `synced`
- `update_pending`
- `conflict`
- `archived`

`translation_queue.review_status`:

- `pending`
- `ai_draft`
- `approved`
- `rejected`
- `edited`

`sync_jobs.status`:

- `pending`
- `running`
- `success`
- `failed`
- `cancelled`

`issue_comments.sync_status`:

- `pending`
- `synced`
- `skipped`
- `failed`

`issue_attachments.download_status`:

- `pending`
- `downloaded`
- `failed`
- `skipped`

`issue_attachments.sync_status`:

- `pending`
- `synced`
- `skipped`
- `failed`

## 7. Backlog inbound trong Lite

Lite dùng pull chủ động, không bắt buộc webhook.

Endpoint:

```text
POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull
POST /api/v1/projects/:projectId/backlog/pull
```

Manual pull tạo job:

- `direction_from = 'backlog'`
- `direction_to = 'cis'`
- `job_type = 'manual_pull'`
- journal `trigger = 'manual'`

Scheduled pull optional:

- dùng `job_type = 'manual_pull'`
- journal `trigger = 'scheduled'`
- `payload_json` chứa mode/cursor/time window.
- dùng `projects`, `pull_state`, `scheduled_pull_filter_json` và Backlog API issue list để tìm issue candidate.

Scheduled pull flow:

1. Tìm project có `enabled = 1`, `sync_enabled = 1`, `scheduled_pull_enabled = 1`.
2. Kiểm tra `backlog_project_key`, `backlog_api_key_env` và interval đã đến.
3. Tính `updated_since = last_successful_pull_at - pull_updated_since_window_minutes`.
4. Gọi Backlog API lấy issue list theo project, `updated_since`, sort `updated asc`, page size mặc định 100.
5. Apply filter nâng cao từ `scheduled_pull_filter_json` nếu có.
6. Enqueue từng issue candidate vào `sync_jobs`.
7. Worker `manual_pull` lấy full issue/comment/attachment metadata bằng normalizer chung.
8. Cập nhật `pull_state` sau page/pull thành công.

Endpoint pull project là bắt buộc trong Lite:

- `POST /api/v1/projects/:projectId/backlog/pull`
- enqueue issue/page candidates cho project đó.
- không sync Jira trực tiếp.

Dedupe pull:

- `source_system = backlog`
- `project_id`
- `backlog_issue_key`
- event type kỹ thuật: `manual_pull_issue`, `scheduled_pull_issue`, `pull_comment`, `pull_attachment`
- `backlog_updated_at`
- `payload_hash` hoặc hash từ normalized payload

Duplicate pull không tạo revision/comment/outbound job trùng.

Backlog worker ingest:

1. Lock job `pending -> running`.
2. Gọi Backlog API lấy full issue/comment/attachment.
3. Dùng Backlog normalizer chung.
4. Tìm/tạo issue theo `(project_id, backlog_issue_key)`.
5. Tạo/cập nhật `issue_revisions`.
6. Cập nhật `issues.fields_json`.
7. Tạo/cập nhật `issue_comments`.
8. Tạo/cập nhật `issue_attachments` metadata.
9. Tạo translation queue nếu cần.
10. Tạo anomaly nếu routing mismatch, mapping gap, translation low confidence hoặc content change lớn.
11. Ghi `sync_journal`.
12. Set job `success` hoặc retry/fail.

Field mapping Backlog -> CIS:

| Backlog field | CIS target |
| --- | --- |
| `issueKey` | `issues.backlog_issue_key` |
| `projectKey` | xác định `project_id` |
| `summary` | `fields_json.summary.backlog`, `issue_revisions.summary` |
| `description` | `fields_json.description.backlog`, `issue_revisions.description` |
| `issueType.name` | `fields_json.issue_type.backlog`, `issue_revisions.issue_type` |
| `status.name` | `fields_json.status.backlog` |
| `priority.name` | `fields_json.priority.backlog`, `issue_revisions.priority` |
| `assignee.name` | `fields_json.assignee.backlog`, `issue_revisions.assignee` |
| `created`/`updated` | `backlog_updated_at`, hash/update detection |

Webhook để Medium:

- `POST /webhooks/backlog`
- `webhook_events`
- verify `X-Webhook-Token`
- dedupe theo event id/header id

Medium phải reuse Backlog normalizer/job/journal của Lite.

## 8. Translation Lite

Provider:

- Default Lite: `codex_exec`.
- Fallback: `manual`.
- `openai_api` chỉ là provider optional/fallback, không phải đường mặc định của Lite.

`codex_exec` là adapter nội bộ để gọi Codex CLI/exec từ worker dịch. Worker truyền prompt dịch, nhận kết quả dạng text/JSON, rồi lưu draft vào `translation_queue`.

Yêu cầu tối thiểu:

- Chạy từ worker job, không chặn API request.
- Có timeout và retry theo chính sách job chung.
- Prompt giữ nguyên code block, link, key kỹ thuật, issue key và format quan trọng.
- Output parse được thành draft dịch và metadata tối thiểu như provider, model/command, confidence nếu có.
- Không log prompt/output chứa secret hoặc command nhạy cảm.
- Nếu `codex_exec` lỗi, job retry hoặc chuyển sang manual-edit với lỗi rõ ràng.

Ngôn ngữ:

- Source: Nhật (`ja`).
- Target: Việt (`vi`).

Field dịch:

- issue summary.
- issue description.
- Backlog comment.

Không dịch attachment text.

Flow:

```text
issues.status: ingested -> pending_translate -> pending_review -> approved
translation_queue.review_status: pending -> ai_draft -> approved|edited|rejected
```

Rules:

- Human review bắt buộc trước khi sync Jira.
- Admin có thể approve draft.
- Admin có thể edit/manual-edit rồi approve.
- Admin có thể reject và retranslate.
- Comment ngắn vẫn cần review.
- Code block giữ nguyên, chỉ dịch text xung quanh.
- AI confidence thấp tạo `translation_low_conf`, ưu tiên review queue nhưng không block sau khi human review.
- Content Backlog thay đổi không ghi đè bản dịch cũ; tạo revision mới và đưa issue về `update_pending`.

Audit:

- AI translate.
- approve/reject/retranslate/manual edit.
- nếu admin sửa text, lưu đủ old/new metadata để Full học sau này.

## 9. Mapping Lite

Mapping qua CIS canonical:

```text
Backlog -> CIS -> Jira
```

Không dùng mapping trực tiếp Backlog -> Jira làm nguồn chính.

Mapping required cho Jira sync:

- `issue_type`
- `status`
- `priority`
- `user`/`assignee` nếu Jira project bắt buộc

Nguồn mapping Lite:

- `manual`
- `config_initial`
- `ai_auto` đơn giản nếu dễ làm; nếu không thì admin tạo thủ công.

Rules:

- Chỉ `approval_status = 'approved'` mới dùng cho sync thật.
- Missing mapping tạo anomaly `mapping_gap`.
- Missing mapping làm dry-run `can_sync = false`.
- Sync thật trả lỗi domain rõ, ví dụ `422 MAPPING_REQUIRED`.
- Sync thật không gọi Jira API nếu thiếu mapping.
- Force approve không bypass missing required mapping.

## 10. Anomaly Lite

Lite cần tối thiểu:

- `routing_mismatch`
- `mapping_gap`
- `translation_low_conf`
- `unusual_field_change`
- `sync_failure_chain`

Rules:

- `routing_mismatch`: không ingest vào `issues`.
- `mapping_gap`: block sync thật.
- `translation_low_conf`: warning, không block sau review.
- `unusual_field_change`: warning hoặc critical; nếu critical thì block outbound cho tới khi resolve/ignore.
- `sync_failure_chain`: hiển thị dashboard/admin.

Action:

- `ignore`
- `resolve`

Critical anomaly không đổi trực tiếp `issues.status`, nhưng outbound worker phải check anomaly còn open/investigating trước khi sync thật.

## 11. Attachment Lite

Mức bắt buộc:

- Lưu metadata vào `issue_attachments`.
- Lưu association với issue/comment.
- Lưu filename, source id, size/mime nếu có, download/sync status.
- Hiển thị trong issue detail.
- Dry-run Jira báo attachment pending/download failed.
- Attachment failure không block issue sync, trừ khi sau này project config đánh dấu required.

Nên làm nếu credential/API sẵn:

- Download file từ Backlog về:

```text
storage/attachments/<project_id>/<issue_id>/<attachment_id>/
```

- Tính `sha256`.
- Cho admin download nội bộ.

Có thể để Medium:

- Upload/copy attachment thật sang Jira.
- Retry sync attachment sang Jira bằng `push_attachment`.

Nếu Lite chưa upload attachment sang Jira, Jira description phải ghi attachment pending trong CIS.

## 12. Sync engine Lite

Worker poll `sync_jobs`:

```text
status = 'pending'
run_after <= now
project.sync_enabled = 1
ORDER BY priority ASC, run_after ASC, created_at ASC
```

Job types Lite:

- `manual_pull`
- `dry_run`
- `push_issue`
- `push_comment`
- `push_attachment` có thể chỉ dùng cho metadata/download retry
- `retry`

Reserved cho Medium:

- `webhook_ingest`

Direction Lite:

- `backlog -> cis`
- `cis -> jira`

Retry:

- Retry tối đa 3 lần.
- Backoff `1m -> 5m -> 15m`.
- `429`: retry theo `Retry-After` nếu có.
- `5xx`/network timeout: retry.
- `4xx`: không retry mặc định, trừ `429`.
- Hết retry: `failed`.
- Admin retry: set failed job về `pending`.
- Chỉ cancel `pending`, không cancel `running`.
- Mỗi attempt ghi `sync_journal`.

Worker nền phải có stale lock recovery:

- Job `running` stale khi `locked_at < now - WORKER_LOCK_TIMEOUT_SECONDS`.
- Nếu `attempt_count < max_attempts`, ghi journal `stale_recovered`, set về `pending`, cập nhật `run_after`.
- Nếu `attempt_count >= max_attempts`, ghi journal `stale_failed`, set `failed`.
- Không recover job `running` còn mới.

## 13. Jira dry-run và sync

Dry-run endpoint:

```text
POST /api/v1/issues/:issueId/dry-run/jira
```

Dry-run không gọi Jira API thật.

Dry-run validate:

- issue/revision/comments/translation reviewed.
- required mapping.
- project sync enabled.
- Jira credential/config.
- critical anomaly còn open/investigating.
- attachment warning.

Response có:

- `payload`
- `validation`
- `warnings`
- `can_sync`

Nếu `can_sync = false`, sync thật không được gọi Jira API.

Sync endpoint:

```text
POST /api/v1/issues/:issueId/sync/jira
```

Có thể trả `202` nếu tạo async job.

Pre-check trước Jira API:

1. Issue không `archived`.
2. Issue `approved` hoặc `update_pending` đã xử lý đủ.
3. Translation required đã `approved` hoặc `edited`.
4. Required mapping approved.
5. Không còn critical blocking anomaly.
6. Project `sync_enabled = 1`.
7. Jira credential/config tồn tại.
8. Dry-run validation không còn lỗi block.

Jira payload:

- project key từ `jira_project_key`.
- issue type từ mapping `backlog -> cis` và `cis -> jira`.
- summary có trace Backlog key, ví dụ `[WEC-123] <summary tiếng Việt đã review>`.
- description gồm Backlog key/url, bản dịch Việt đã review, original Nhật, attachment pending note nếu có, và trace block cố định.
- priority từ mapping.
- labels như `cis-sync` và `backlog-wec-123` nếu Jira cho phép.

Jira trace block bắt buộc:

```text
CIS Sync Trace
- CIS Issue ID: <cis_issue_id>
- Backlog Issue Key: <backlog_issue_key>
- Source: backlog
```

Jira idempotency:

1. Nếu `issues.jira_issue_key` đã có, update Jira issue đó.
2. Nếu chưa có `jira_issue_key`, search Jira theo Backlog issue key trong summary/description/label.
3. Nếu match đúng một issue, lưu `jira_issue_key` vào CIS rồi update.
4. Nếu match nhiều issue, tạo anomaly/conflict và không create issue mới.
5. Nếu không match, create Jira issue mới.
6. Sync lại cùng CIS issue không được tạo Jira issue trùng.

Sau Jira success:

- update `issues.jira_issue_key`.
- `issues.status = 'synced'`.
- update `last_synced_at`.
- update `fields_json` phía Jira nếu có.
- ghi journal `direction_from = 'cis'`, `direction_to = 'jira'`.

Comment sync:

- Chỉ sync comment Backlog đã dịch và review.
- Thành công thì update `issue_comments.jira_comment_id`, `sync_status = 'synced'`.
- Comment fail không rollback toàn issue; retry riêng.

## 14. API Lite

Response success:

```json
{ "data": {} }
```

List:

```json
{ "data": [], "meta": { "page": 1, "page_size": 50, "total": 0, "total_pages": 0 } }
```

Error:

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

Endpoint bắt buộc:

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

Medium endpoints:

```text
POST /webhooks/backlog
POST /webhooks/jira
POST /api/v1/mapping-rules/bulk-approve
POST /api/v1/projects/:projectId/jira/pull
POST /api/v1/projects/:projectId/jira/issues/:jiraIssueKey/pull
POST /api/v1/attachments/:attachmentId/retry-sync
```

## 15. Admin UI Lite

UI bắt buộc:

- Login.
- Dashboard health tối thiểu.
- Project list/detail/config.
- Issue list theo project/status/text search nếu được.
- Issue detail hiển thị:
  - Backlog original tiếng Nhật.
  - AI draft/reviewed tiếng Việt.
  - comments.
  - attachment metadata/status.
  - mapping/anomaly/sync state.
- Translation review.
- Mapping approval thủ công.
- Anomaly list/detail.
- Sync jobs.
- Sync journal.
- Dry-run Jira result.

Dashboard counts:

- pull jobs pending/failed.
- translation pending/ai_draft.
- issue pending mapping.
- sync job failed.
- anomaly open.

## 16. Auth, audit, logging

Auth:

- Simple JWT.
- Email + password.
- Password hash bằng bcrypt/argon2 hoặc tương đương.
- Bearer token.
- Token hết hạn trả `401`.
- Lite chỉ cần admin.

Audit/logging:

- correlation id cho API request, pull job, sync job, error response.
- action ghi quan trọng phải ghi journal/audit.
- `reason` optional cho force/ignore/reject.

Không log:

- Authorization header.
- Backlog/Jira API token.
- `CODEX_EXEC_COMMAND` nếu command có chứa tham số nhạy cảm.
- OpenAI API key nếu bật provider fallback `openai_api`.
- JWT secret.
- webhook token sau này.

Retention:

- `sync_journal`: 3 tháng.
- `anomaly_log`: 3 tháng.
- `webhook_events`: 3 tháng nếu tạo sẵn/bật ở Medium.

Backup:

- Lite cần document backup SQLite.
- Chưa cần backup tự động.

## 17. Thứ tự implement đề xuất

1. App skeleton Express CommonJS.
2. Config/env loader.
3. `src/infrastructure/database`: SQLite connection, migration runner, transaction helper.
4. Storage bootstrap.
5. Error envelope + correlation id middleware.
6. Auth/admin bootstrap.
7. Project config seed JSON + CRUD.
8. CIS schema: issues/revisions/comments/attachments.
9. `sync_jobs` + `sync_journal`.
10. Backlog client + manual issue pull API + project pull API.
11. Backlog normalizer + CIS upsert.
12. Translation queue + `codex_exec` provider + manual fallback; OpenAI API chỉ optional/fallback.
13. Translation review APIs/UI.
14. Mapping rules + required mapping pre-check.
15. Anomaly subset.
16. Dry-run Jira payload builder.
17. Jira client + push issue/comment.
18. Worker loop + retry/backoff.
19. Worker stale lock recovery.
20. Dashboard counts.
21. Acceptance verification.

Verification command bắt buộc theo phase:

```text
npm run verify:phase00
npm run verify:phase01
npm run verify:phase02
npm run verify:phase03
npm run verify:phase04
npm run verify:phase05
npm run verify:phase06
npm run verify:phase07
```

Nếu chưa có test runner chính thức, tạo script Node tối thiểu trong `scripts/verify/` và command phải exit code khác `0` khi fail.

## 18. Definition of Done Lite

Lite đạt yêu cầu khi:

1. Admin login được bằng JWT.
2. Tạo/import project config từ JSON và chỉnh được qua UI.
3. Backlog manual pull tạo inbound job `backlog -> cis`.
4. Pull dedupe hoạt động, duplicate không tạo revision/comment/outbound job trùng.
5. Worker ingest issue/comment/attachment metadata vào CIS và tạo revision đúng.
6. Issue mới đi đúng state `ingested -> pending_translate -> pending_review`.
7. `codex_exec` tạo draft Nhật -> Việt cho summary, description, comment; nếu lỗi có trạng thái rõ để retry hoặc manual-edit.
8. Admin approve/edit/reject/retranslate được translation.
9. Missing mapping tạo anomaly và block sync thật.
10. Dry-run Jira trả payload + validation + warning rõ ràng.
11. Sync thật không gọi Jira nếu pre-check fail.
12. Sync thật tạo/update Jira issue khi pre-check pass.
13. Comment Backlog đã review sync được lên Jira hoặc fail/retry riêng.
14. Attachment failure không block issue sync và được hiển thị pending.
15. Mọi action quan trọng có journal/audit và correlation id.
16. Job lỗi retry đúng policy, hết retry chuyển `failed`, admin retry được.
17. Dashboard cho thấy pending review, missing mapping, failed jobs và open anomalies.

## 19. Quyết định cần nhớ từ interview nhưng Lite điều chỉnh

Từ interview:

- MVP có webhook và Jira inbound.
- MVP lưu raw webhook payload.
- MVP attachment file thật Backlog -> CIS -> Jira.
- MVP mapping có AI propose.

Lite điều chỉnh:

- Không bắt buộc webhook; dùng manual/scheduled pull.
- `webhook_events` optional/reserved.
- Attachment upload sang Jira có thể để Medium, nhưng metadata/status phải có.
- AI mapping nâng cao có thể để Medium; Lite cần manual/config mapping đủ để block/pass sync.

Không được điều chỉnh:

- System -> CIS -> System.
- SQLite.
- Admin UI.
- AI translate thật Nhật -> Việt bằng `codex_exec` là provider chính trong Lite.
- Human review bắt buộc.
- Dry-run trước Jira sync.
- Mapping approve trước sync.
- `direction_from` và `direction_to`.
- Job/journal/audit/retry.
