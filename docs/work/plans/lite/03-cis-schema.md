# Lite - CIS schema và state

## Bảng bắt buộc

Lite nên tạo schema gần với MVP ngay từ đầu để Medium kế thừa bằng migration nhỏ.

- `schema_migrations`
- `admin_users` hoặc bảng user tương đương cho JWT login.
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
- `webhook_events` optional/reserved cho Medium nếu muốn tạo schema sẵn.
- `pull_state` hoặc field tương đương để lưu cursor/`last_pulled_at` cho scheduled pull.

## Nguyên tắc schema

- `issues.id` là id nội bộ, không dùng trực tiếp Backlog/Jira key làm primary key.
- `issues.fields_json` giữ field-level source tracking.
- `issue_revisions` giữ content history, không ghi đè nội dung cũ.
- Lite không bắt buộc có webhook payload. Với manual/scheduled pull, phải lưu được snapshot hoặc metadata nguồn trong `sync_jobs.payload_json`, `sync_journal`, hoặc bảng raw pull riêng nếu cần debug/replay.
- Nếu tạo sẵn `webhook_events`, đánh dấu là reserved cho Medium, không dùng như nguồn ingest chính trong Lite.
- `sync_jobs` và `sync_journal` dùng `direction_from` và `direction_to`.
- `mapping_rules` cũng dùng `direction_from` và `direction_to`.
- Không quay lại mapping trực tiếp Backlog -> Jira như thiết kế cũ.
- `translation_queue` cần lưu metadata provider để audit và debug. Với Lite, provider mặc định là `codex_exec`; nên có chỗ lưu `provider`, `model_or_command`, `provider_request_id` nếu có, `confidence` nếu có, và lỗi provider khi job thất bại.

## State bắt buộc

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

`webhook_events.status` nếu tạo sẵn cho Medium:

- `received`
- `queued`
- `processed`
- `duplicate`
- `rejected`
- `unmatched_project`
- `failed`

## Flow state chính

Backlog issue mới:

```text
manual pull/scheduled pull
  -> ingested
  -> pending_translate
  -> pending_review
  -> approved
  -> syncing
  -> synced
```

Backlog update:

```text
synced/approved
  -> update_pending
  -> pending_translate hoặc pending_review nếu cần dịch/review lại
  -> approved
  -> syncing
  -> synced
```

Rule update:

- Content thay đổi: tạo revision mới, không ghi đè bản dịch đã duyệt.
- Metadata thay đổi: không cần dịch lại, nhưng phải check mapping/conflict trước outbound.
- Lite chưa có Jira inbound đầy đủ nên conflict phức tạp có thể để Medium, nhưng status `conflict` và UI hiển thị phải tồn tại để không đổi contract.
