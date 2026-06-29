# Lite - Sync engine và Jira outbound

## Worker queue

Lite dùng worker poll `sync_jobs` trong SQLite.

Query nguyên tắc:

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
- `push_attachment` có thể chỉ dùng cho download/retry metadata ở Lite.
- `retry`
- `webhook_ingest` reserved cho Medium.

Direction Lite:

- `backlog -> cis`
- `cis -> jira`

Direction chuẩn bị nhưng chưa bật đầy đủ:

- `jira -> cis`
- `cis -> backlog`
- `backlog -> cis` qua webhook.

## Retry

- Retry tự động tối đa 3 lần cho lỗi retryable.
- Backoff: `1m -> 5m -> 15m`.
- `429`: dùng `Retry-After` nếu có, nếu không dùng backoff.
- `5xx`/network timeout: retry.
- `4xx`: không retry mặc định, trừ `429`.
- Hết retry: job `failed`.
- Admin retry job failed bằng cách set lại `pending`.
- Chỉ cancel job `pending`, không cancel job `running`.
- Mỗi attempt phải ghi `sync_journal`.

## Attachment Lite

Mức bắt buộc:

- Lưu metadata attachment vào `issue_attachments`.
- Lưu association với issue/comment.
- Lưu `original_filename`, source id, size/mime nếu có, status download/sync.
- Hiển thị attachment trong issue detail.
- Dry-run Jira phải báo attachment nào pending/download failed.
- Attachment failure không block issue sync, trừ khi project sau này đánh dấu attachment required.

Mức nên làm nếu API credential đã sẵn:

- Tải file thật từ Backlog về `storage/attachments/<project_id>/<issue_id>/<attachment_id>/`.
- Tính `sha256`.
- Cho phép download nội bộ từ Admin UI.

Mức có thể để Medium:

- Upload/copy attachment thật sang Jira.
- Retry sync attachment sang Jira bằng job riêng `push_attachment`.

Nếu Lite chưa upload attachment sang Jira, Jira description khi sync issue phải ghi rõ attachment đang pending trong CIS để không mất dấu.

## Dry-run Jira

Endpoint:

```text
POST /api/v1/issues/:issueId/dry-run/jira
```

Dry-run không gọi Jira API tạo/update issue thật.

Dry-run phải:

1. Lấy issue, revision hiện tại, comments, translation reviewed, mapping và attachment metadata.
2. Build Jira payload giống sync thật.
3. Validate required mapping.
4. Validate translation đã approved/edited.
5. Validate project sync enabled.
6. Validate Jira credential/config tồn tại.
7. Kiểm tra critical anomaly còn open/investigating.
8. Trả `payload`, `validation`, `warnings`, `can_sync`.
9. Ghi audit/journal `action = 'dry_run'` nếu implementation chọn dry-run là action ghi.

Response:

```json
{
  "data": {
    "issue_id": "issue_123",
    "target": "jira",
    "mode": "dry_run",
    "can_sync": false,
    "payload": {},
    "validation": {
      "missing_required_mapping": [],
      "attachments": [],
      "warnings": []
    }
  }
}
```

Nếu `can_sync = false`, sync thật không được gọi Jira API.

## Sync Jira thật

Endpoint:

```text
POST /api/v1/issues/:issueId/sync/jira
```

Sync thật có thể trả `202` nếu tạo async job.

Pre-check bắt buộc trước khi gọi Jira:

1. Issue không `archived`.
2. Issue có status phù hợp: `approved` hoặc `update_pending` đã được xử lý đủ.
3. Translation bắt buộc đã `approved` hoặc `edited`.
4. Required mapping đã approved.
5. Không còn critical blocking anomaly.
6. Project `sync_enabled = 1`.
7. Jira credential/config tồn tại.
8. Dry-run validation không còn lỗi block.

Build Jira payload:

- `project.key` từ `jira_project_key`.
- Issue type từ mapping `backlog -> cis` và `cis -> jira`.
- Summary có trace Backlog key, ví dụ `[BACKLOG-123] ...`.
- Description gồm Backlog issue key/url, bản dịch tiếng Việt đã review, original tiếng Nhật và attachment pending note nếu có.
- Priority từ mapping.
- Labels mặc định như `backlog-migrated` nếu project config yêu cầu.

Sau khi Jira API thành công:

- Cập nhật `issues.jira_issue_key`.
- Cập nhật `issues.status = 'synced'`.
- Cập nhật `issues.last_synced_at`.
- Cập nhật field Jira tương ứng trong `fields_json` nếu có.
- Ghi `sync_journal` với `direction_from = 'cis'`, `direction_to = 'jira'`, `action = 'create' | 'update'`, `status = 'success'`.

Comment sync:

- Chỉ sync comment Backlog đã dịch và review.
- Khi sync comment thành công, cập nhật `issue_comments.jira_comment_id` và `sync_status = 'synced'`.
- Nếu comment sync fail, không rollback toàn bộ issue; comment/job retry riêng.
