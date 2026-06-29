# Lite - Backlog pull vào CIS

## Quyết định Lite

Lite **không bắt buộc dùng webhook**. Backlog inbound trong Lite đi bằng:

```text
Admin manual pull
Scheduled pull optional
```

Mục tiêu là giảm rủi ro public endpoint, verify token, retry webhook và setup bên Backlog ở giai đoạn đầu. Dữ liệu vẫn đi đúng model:

```text
Backlog -> CIS -> System
```

## Manual pull

Manual pull dùng cho import ban đầu, recover dữ liệu bị thiếu hoặc debug issue cụ thể.

Endpoint Lite:

```text
POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull
```

Endpoint pull cả project là bắt buộc trong Lite:

```text
POST /api/v1/projects/:projectId/backlog/pull
```

Manual pull phải tạo `sync_jobs`:

- `direction_from = 'backlog'`
- `direction_to = 'cis'`
- `job_type = 'manual_pull'`
- `trigger = 'manual'` trong journal khi worker xử lý.

## Scheduled pull optional

Nếu bật scheduler trong Lite, scheduler không cần job type mới. Có thể dùng:

- `job_type = 'manual_pull'`
- `trigger = 'scheduled'`
- `payload_json` chứa mode, cursor và time window.

Scheduled pull nên chạy theo project:

1. Đọc project có `sync_enabled = 1` và `scheduled_pull_enabled = 1`.
2. Tính `updated_since` từ `last_backlog_pull_at` trừ một khoảng an toàn, ví dụ `pull_updated_since_window_minutes`.
3. Gọi Backlog API để lấy issue updated sau mốc đó.
4. Enqueue từng issue hoặc từng page pull vào `sync_jobs`.
5. Cập nhật pull cursor/state sau khi pull thành công.

Nếu chưa bật scheduler, Lite vẫn đạt yêu cầu bằng manual pull theo issue/project.

## Dedupe cho pull

Vì Lite không dùng webhook event id, dedupe dựa trên dữ liệu pull:

- `source_system = backlog`
- `project_id`
- `backlog_issue_key`
- `event_type` kỹ thuật: `manual_pull_issue`, `scheduled_pull_issue`, `pull_comment`, `pull_attachment`
- `backlog_updated_at`
- `payload_hash` hoặc hash từ normalized issue/comment/attachment.

Duplicate pull không tạo revision/comment/job outbound trùng. Worker có thể ghi journal `skip` nếu cần audit, nhưng không bắt buộc ghi journal cho mọi duplicate snapshot.

## Raw data và audit

Lite không cần `webhook_events` làm nguồn chính. Tuy vậy vẫn phải giữ đủ dữ liệu debug:

- `sync_jobs.payload_json` lưu request context: project, issue key, pull mode, cursor.
- `sync_journal` ghi kết quả pull.
- Có thể lưu raw API response trong một bảng raw pull riêng hoặc trong payload debug có giới hạn nếu cần replay.

Không lưu secret/token vào payload hoặc journal.

## Worker ingest

Worker xử lý inbound job theo flow:

1. Lock job `pending -> running`.
2. Gọi Backlog API lấy full issue/comment/attachment theo job payload.
3. Với scheduled pull theo page/list, enqueue hoặc xử lý từng issue bằng cùng normalizer.
4. Tìm project theo Backlog project key/prefix.
5. Tìm hoặc tạo `issues` theo `(project_id, backlog_issue_key)`.
6. Tạo hoặc cập nhật `issue_revisions`.
7. Cập nhật `issues.fields_json`.
8. Tạo/cập nhật `issue_comments`.
9. Tạo/cập nhật `issue_attachments` metadata.
10. Tạo translation queue nếu cần.
11. Tạo anomaly nếu có routing mismatch, mapping gap, translation low confidence hoặc content change lớn.
12. Ghi `sync_journal`.
13. Set job `success` hoặc retry/fail.

## Field mapping Backlog -> CIS

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

## Webhook để Medium

Các thiết kế sau không nằm trong scope bắt buộc của Lite:

- `POST /webhooks/backlog`.
- Verify `X-Webhook-Token`.
- `webhook_events` làm raw inbound event log.
- Dedupe theo webhook event id/header id.

Medium sẽ thêm webhook nhưng phải dùng lại Backlog normalizer, `sync_jobs`, `sync_journal`, mapping/anomaly và state machine của Lite.
