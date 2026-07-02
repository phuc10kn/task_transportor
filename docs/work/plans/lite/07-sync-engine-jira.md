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
- `translate` cho global translation queue/worker path; Issue Editor direct translate hiện gọi provider ngay trong request và không enqueue `sync_jobs`.
- `push_issue`
- `push_comment`
- `noop_test` chỉ dùng cho verify/test.

Job type chuẩn bị nhưng chưa có default handler trong code Lite hiện tại:

- `push_attachment` dành cho chiều CIS -> Jira khi bật upload/sync attachment sang Jira.
- `webhook_ingest` reserved cho Medium.

`dry_run` hiện không phải job type trong worker registry; Jira dry-run chạy qua endpoint `POST /api/v1/issues/:issueId/dry-run/jira` và ghi journal.

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
- Issue Editor dry-run hiện tại không check hoặc warning attachment vì attachment outbound chưa nối vào flow này.
- Attachment failure không block issue sync, trừ khi project sau này đánh dấu attachment required.

Backlog -> CIS trong Phase 03:

- Tải file thật từ Backlog về `storage/attachments/<project_id>/<issue_id>/<attachment_id>/`.
- Tính `sha256`.
- Set `download_status = downloaded` nếu tải thành công.
- Giữ `sync_status = pending` vì chưa upload sang Jira.
- Retry download bằng `POST /api/v1/attachments/:attachmentId/retry-download`, không enqueue job.
- Code Lite hiện tại chưa có endpoint download file trực tiếp từ Admin API.

CIS -> Jira trong Phase 06 hoặc Medium:

- Upload/copy attachment thật sang Jira.
- Retry sync attachment sang Jira bằng job riêng `push_attachment`.
- Khi upload Jira thành công, cập nhật `issue_attachments.jira_attachment_id` và `sync_status = synced`.

Attachment sync sẽ có flow/pre-check riêng khi được implement. Không nhét attachment pending note vào issue payload v1 của Issue Editor.

## Dry-run Jira

Endpoint:

```text
POST /api/v1/issues/:issueId/dry-run/jira
```

Dry-run không gọi Jira API tạo/update issue thật.

Dry-run phải:

1. Lấy issue, revision hiện tại, canonical effective values, mapping và các metadata cần preview.
2. Build Jira payload giống sync thật.
3. Validate required mapping.
4. Không validate translation queue như gate chặn issue canonical sync trong Issue Editor flow.
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

Phase 05 implementation trả thêm:

- `validation.errors[]` với code rõ cho UI, ví dụ `MAPPING_REQUIRED`, `ANOMALY_BLOCKED`, `JIRA_CONFIG_REQUIRED`, `DRY_RUN_STALE`.
- `validation.missing_required_mapping[]` để admin biết rule nào cần tạo/approve.
- `validation.blocking_anomalies[]` cho critical anomaly còn `open` hoặc `investigating`.
- Attachment outbound chưa nối vào Issue Editor dry-run/sync, nên issue dry-run hiện tại không check hoặc warning attachment.
- `payload.operation = "create" | "update"` và `payload.transition_preview` để preview khác biệt giữa create/update và trạng thái Jira dự kiến.

Dry-run ghi `sync_journal` action `dry_run`, direction `cis -> jira`, nhưng không enqueue job và không gọi Jira API thật.

## Sync Jira thật

Endpoint:

```text
POST /api/v1/issues/:issueId/sync/jira
```

Sync thật có thể trả `202` nếu tạo async job.

Phase 06 hiện enqueue `push_issue` job sau pre-check. Nếu issue đã có `push_issue` job `pending` hoặc `running`, API trả lại job active đó để tránh xếp hàng trùng.

Pre-check bắt buộc trước khi gọi Jira:

1. Issue không `archived`.
2. Issue có status phù hợp: `approved` hoặc `update_pending` đã được xử lý đủ.
3. Dry-run mới nhất khớp canonical hash hiện tại.
4. Required mapping đã approved.
5. Không còn critical blocking anomaly.
6. Project `sync_enabled = 1`.
7. Jira credential/config tồn tại.
8. Dry-run validation không còn lỗi block.

Build Jira payload:

- `project.key` từ `jira_project_key`.
- Issue type từ mapping `backlog -> cis` và `cis -> jira`.
- Summary lấy từ canonical effective value hoặc override đã chỉnh trong Jira sync modal.
- Description lấy từ canonical effective value hoặc override đã chỉnh trong Jira sync modal.
- Priority từ mapping.
- Labels/components/fix_versions/worklogs chưa nằm trong issue payload v1.
- Nếu có assignee mapping thì payload Jira dùng `fields.assignee.accountId`.

Idempotency thực tế của phase 06:

1. Nếu `issues.jira_issue_key` đã có, worker update Jira issue đó.
2. Nếu chưa có `jira_issue_key`, worker search Jira theo trace Backlog key/CIS issue id.
3. Nếu match đúng một issue, worker link lại `jira_issue_key` vào CIS rồi update.
4. Nếu match nhiều issue, worker không create mới; thay vào đó set `issues.sync_status = 'conflict'`, ghi anomaly `unusual_field_change` với `details_json.reason = "jira_trace_conflict"` và fail job.
5. Nếu không match, worker create issue mới.

Sau khi Jira API thành công:

- Cập nhật `issues.jira_issue_key`.
- Cập nhật `issues.sync_status = 'synced'`.
- Cập nhật `issues.last_synced_at`.
- Cập nhật field Jira tương ứng trong `fields_json` nếu có.
- Ghi `sync_journal` với `direction_from = 'cis'`, `direction_to = 'jira'`, `action = 'create' | 'update'`, `status = 'success'`.

Comment sync:

- Chỉ sync comment Backlog đã dịch và review.
- `push_issue` success sẽ tự enqueue `push_comment` cho các comment backlog có `content_translated` nhưng `sync_status != 'synced'`.
- Khi sync comment thành công, cập nhật `issue_comments.jira_comment_id` và `sync_status = 'synced'`.
- Nếu comment sync fail, không rollback toàn bộ issue; comment/job retry riêng.
