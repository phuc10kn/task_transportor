# Lite - Checklist và Definition of Done

## Checklist triển khai

### 1. Runtime/bootstrap

- Express app chạy được.
- Config/env loader.
- Storage directory bootstrap.
- Migration runner.
- Admin bootstrap/CLI.

### 2. Database

- Tạo đủ bảng Lite.
- Tạo index quan trọng theo project/status/dedupe/job pending.
- Tạo seed project JSON.

### 3. API nền

- Correlation id middleware.
- Auth middleware.
- Response/error envelope.
- Pagination/filter/sort cơ bản.

### 4. Pull/ingest

- Manual pull Backlog issue.
- Manual pull Backlog project bắt buộc.
- Scheduled pull optional nếu bật.
- Dedupe theo issue/update/hash.
- Enqueue job.
- Backlog manual pull.
- Backlog normalizer.

### 5. Worker

- Poll pending jobs.
- Lock job.
- Transaction per job.
- Retry/backoff.
- Journal per attempt.

### 6. Translation

- `codex_exec` provider chính.
- OpenAI API provider chỉ là optional/fallback.
- Manual fallback.
- Translation queue.
- Review/approve/reject/retranslate/manual edit.

### 7. Mapping/anomaly

- Mapping CRUD/approve/reject.
- Required mapping pre-check.
- `routing_mismatch`, `mapping_gap`, `translation_low_conf`, `unusual_field_change`, `sync_failure_chain`.

### 8. Jira outbound

- Dry-run payload builder.
- Sync job create.
- Jira create/update issue.
- Jira comment sync.
- Update CIS state/journal.

### 9. Admin UI

- Login.
- Dashboard.
- Projects.
- Issues.
- Translation review.
- Mapping.
- Anomalies.
- Jobs/journal.
- Attachments metadata/download nếu có.

## Definition of Done

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
