# Phase 02 - CIS schema, worker nền, jobs và journal

## Mục tiêu

Dựng schema CIS và job/audit nền trước khi ingest dữ liệu thật. Đây là chỗ khóa contract để Medium kế thừa và là nơi đặt worker nền cho các phase sau.

## Làm trong phase này

- Tạo bảng `issues`.
- Tạo bảng `issue_revisions`.
- Tạo bảng `issue_comments`.
- Tạo bảng `issue_attachments`.
- Tạo bảng `translation_queue`.
- Tạo bảng `mapping_rules`.
- Tạo bảng `anomaly_log`.
- Tạo bảng `sync_jobs`.
- Tạo bảng `sync_journal`.
- Tạo `pull_state` hoặc field tương đương.
- Tạo repository/helper cho transaction.
- Tạo helper enqueue job và ghi journal.
- Tạo state constants cho issue, translation, job, comment, attachment.
- Tạo worker nền tối thiểu cho `sync_jobs`.
- Tạo lock job `pending -> running` với `locked_at`, `locked_by`, `attempt_count`.
- Tạo `run_after`, `max_attempts`, retry/backoff và fail policy nền.
- Tạo stale lock recovery cho job `running` bị treo.
- Tạo handler registry để phase sau đăng ký `manual_pull`, `translate`, `push_issue`, `push_comment`.
- Tạo noop/test handler để kiểm tra lifecycle job trước khi có tích hợp thật.

## Worker config

Worker nền cần có config:

- `WORKER_ID`
- `WORKER_POLL_INTERVAL_MS`
- `WORKER_LOCK_TIMEOUT_SECONDS`

## Stale lock recovery

Job `running` được coi là stale khi:

```text
locked_at < now - WORKER_LOCK_TIMEOUT_SECONDS
```

Quy tắc recover:

1. Nếu `attempt_count < max_attempts`, ghi journal `stale_recovered`, set job về `pending`, cập nhật `run_after` theo backoff.
2. Nếu `attempt_count >= max_attempts`, ghi journal `stale_failed`, set job `failed`.
3. Không recover job `running` còn mới.
4. Mỗi lần recover phải giữ `direction_from`, `direction_to`, `job_type`, payload và error metadata đủ để debug.

## Deliverables

- Migration đầy đủ cho schema CIS Lite.
- Repository/helper transaction.
- Job repository với enqueue, lock, success, fail, retry, cancel.
- Worker loop nền.
- Handler registry.
- Noop/test handler cho job lifecycle.
- Stale lock recovery.
- Sync journal writer.
- State constants dùng chung.
- Test script tự động theo capability cho CIS schema, job lifecycle, retry và journal.

## Chốt chặn

Phase này đạt khi có thể tạo dữ liệu CIS giả, enqueue job, worker lock/chạy handler/update trạng thái job, retry/fail đúng policy nền, và journal ghi được `direction_from`/`direction_to`.

Không đi phase 03 nếu:

- `sync_jobs`, `sync_journal`, `mapping_rules` không có `direction_from` và `direction_to`.
- `issues.id` đang dùng Backlog/Jira key làm primary key.
- Không có transaction boundary cho thao tác job quan trọng.
- `translation_queue` chưa lưu được provider metadata cho `codex_exec`.
- Worker chưa có cơ chế lock job để tránh hai worker xử lý cùng một job.
- Worker chưa recover được job `running` bị treo theo timeout.
- Chưa có handler registry và noop/test handler để test lifecycle.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [x] Test script tự động của phase 02 pass, ví dụ `npm run verify:phase02` (alias tới `npm run verify:cis` và `npm run verify:sync-jobs`).
- [x] Test migration tạo đủ bảng Lite.
- [x] Test insert project giả và issue giả.
- [x] Test insert issue revision không ghi đè revision cũ.
- [x] Test enqueue job `backlog -> cis`.
- [x] Test chuyển job `pending -> running -> success`.
- [x] Test worker lock và chạy noop/test handler thành công.
- [x] Test ghi journal cho mỗi transition.
- [x] Test query pending jobs theo `status`, `run_after`, `priority`.
- [x] Test retry job fail bằng `run_after` và `attempt_count`.
- [x] Test job `running` quá `WORKER_LOCK_TIMEOUT_SECONDS` được recover đúng.
- [x] Test job `running` còn mới không bị recover.
- [x] Test cancel được job `pending`, không cancel job `running`.
- [x] Test insert translation queue với `provider = codex_exec` và `model_or_command`.

### Manual check (Người review)

- [x] Chạy migration và xác nhận DB có đủ bảng Lite.
- [x] Tạo job giả bằng API/CLI.
- [x] Chạy worker local và thấy job chuyển trạng thái.
- [x] Mở API/CLI xem `sync_journal` có transition tương ứng.
- [x] Tạo một job fail giả và xác nhận retry/backoff hiển thị đúng.

## Ghi chú thiết kế

- `webhook_events` nếu tạo thì đánh dấu reserved, không dùng làm nguồn ingest chính trong Lite.
- Không tạo mapping trực tiếp Backlog -> Jira làm đường chính.
