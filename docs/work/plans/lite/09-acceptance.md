# Cập nhật acceptance - Issue Editor IE-02

Issue Editor được xem là đạt phạm vi Lite khi:

1. Admin mở được Issue Editor trực tiếp từ Issue list.
2. Admin sửa được canonical fields trong `fields_json.*.cis` mà không ghi đè source `backlog`/`jira`.
3. Dry-run Jira dùng canonical effective values mới nhất.
4. Payload Jira không có `labels`, `components`, `fix_versions`, `worklogs` trong issue payload v1.
5. Translation queue/review không còn block issue canonical sync Jira.
6. Mapping, anomaly, Jira config và stale dry-run vẫn block sync thật.
7. Sync thật trả `DRY_RUN_STALE` nếu canonical hash đã đổi sau dry-run.
8. Attachment outbound chưa nối vào Issue Editor dry-run/sync, nên issue dry-run không check hoặc warning attachment.
9. Translation modal trong Issue Editor chỉ lấy source từ Backlog branch hiện tại, không fallback sang queue cũ/CIS/revision.
10. `Approve + save` translation apply reviewed text vào `fields_json.<target_field>.cis`.
11. Jira sync modal tự dry-run, cho sửa payload target, sync bằng payload đã chỉnh và lưu các draft field có giá trị vào `fields_json.<field>.jira`.
12. Project Config disable `Pull whole project` ở FE; UI acceptance dùng `Pull one issue` và `Resync from Backlog`.

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
- Manual pull Backlog one issue bắt buộc trong UI hiện tại; project pull có thể tồn tại ở API nhưng đang disable ở FE.
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
5. Worker ingest issue/comment/attachment metadata vào CIS, download attachment file thật nếu có credential/API, và tạo revision đúng.
6. Issue mới từ `System -> CIS` đi đúng state `ingested` và không tự tạo queue/job dịch.
7. Nếu bật translation option, `codex_exec` tạo draft Nhật -> Việt cho summary, description, comment; nếu lỗi có trạng thái rõ để retry hoặc manual-edit.
8. Admin approve/edit/reject/retranslate được translation khi translation option được dùng.
9. Missing mapping tạo anomaly và block sync thật.
10. Dry-run Jira trả payload + validation + warning rõ ràng.
11. Sync thật không gọi Jira nếu pre-check fail.
12. Sync thật tạo/update Jira issue khi pre-check pass.
13. Comment Backlog đã review sync được lên Jira hoặc fail/retry riêng.
14. Attachment download failure không block issue ingest/sync, được hiển thị bằng `download_status = failed`, và có retry download; attachment chưa upload Jira giữ `sync_status = pending`.
15. Mọi action quan trọng có journal/audit và correlation id.
16. Job lỗi retry đúng policy, hết retry chuyển `failed`, admin retry được.
17. Dashboard cho thấy pending review, missing mapping, failed jobs và open anomalies.
