# Phase 08 - Verification matrix

File này mô tả cách kiểm chứng từng phase. Mỗi phase cần có cả `Unit test check (Agent)` và `Manual check (Người review)`. Unit test check giúp chống regression bằng script/fixture/fake adapter; manual check xác nhận luồng vận hành thật.

## Nguyên tắc test

- Mỗi phase phải có ít nhất một command verify tự động cho Agent.
- File/script verify nên chia theo chức năng/capability, không chia theo phase. Phase command chỉ là alias ghép các capability cần thiết cho checklist phase.
- Unit test check ưu tiên dùng fixture/fake adapter để không phụ thuộc Backlog/Jira thật.
- Manual check vẫn bắt buộc cho API/UI/worker flow chính.
- Test không được cần secret thật trong repo.
- Test không được ghi dữ liệu thật vào `storage/` đã dùng cho dev/prod; dùng DB test riêng.

## Capability verify hiện tại

```text
npm run verify:foundation
npm run verify:auth
npm run verify:projects
npm run verify:cis
npm run verify:sync-jobs
npm run verify:backlog-ingestion
npm run verify:translation-review
npm run verify:mapping-anomaly-dryrun
npm run verify:jira-outbound
```

Các command theo phase phải tiếp tục tồn tại để phase checklist ổn định, nhưng nên gọi các capability command thay vì trỏ trực tiếp tới file `phaseXX.js`.

## Matrix

| Phase | Unit test check (Agent) | Manual check (Người review) | Fixture/fake cần có |
| --- | --- | --- | --- |
| 00 Foundation | Migrate, health, error envelope, config fail-fast | Start app, curl health, curl 404 | `.env.test`, SQLite test DB |
| 01 Auth/Projects | Admin bootstrap, login, protected route, project CRUD | Login qua API, tạo project, bật/tắt sync | Project seed JSON |
| 02 CIS/Jobs | Migration schema, enqueue, lock, noop handler, retry, cancel, journal | Tạo job giả, chạy worker, xem journal | Noop job handler |
| 03 Backlog ingestion | Ingest Backlog fixture, dedupe, attachment download/retry, missing credential fail | Pull issue theo project từ API; pull issue có attachment thật; retry attachment download nếu fail | Backlog fixture/fake client |
| 04 Translation review | Fake `codex_exec` success, timeout, parse error, approve/edit/reject | Review translation từ API | Fake `codex_exec` command |
| 05 Mapping/Anomaly/Dry-run | Missing mapping, approved mapping, critical anomaly, stale dry-run | Gọi dry-run và kiểm tra `can_sync` | Issue fixture có canonical fields |
| 06 Jira outbound | Fake Jira create/update/search, retry `429`/`5xx`, no duplicate | Sync Jira sandbox hoặc môi trường test | Fake Jira client |
| 07 Admin UI/Acceptance | Smoke API/UI nếu có stack hỗ trợ | Chạy end-to-end bằng UI | Demo seed data |

## Command bắt buộc theo phase

Khi implement xong một phase, repo phải có command verify tương ứng. Nếu chưa có test runner chính thức, tạo script Node tối thiểu theo capability trong `scripts/verify/` và command phải exit code khác `0` khi fail.

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

Khi repo đã có test runner ổn định, các command này có thể gọi test runner chung, nhưng tên command phase vẫn phải tồn tại.

Ví dụ mapping hiện tại:

```text
npm run verify:phase00 -> npm run verify:foundation
npm run verify:phase01 -> npm run verify:auth && npm run verify:projects
npm run verify:phase02 -> npm run verify:cis && npm run verify:sync-jobs
npm run verify:phase03 -> npm run verify:backlog-ingestion
npm run verify:phase04 -> npm run verify:translation-review
npm run verify:phase05 -> npm run verify:mapping-anomaly-dryrun
npm run verify:phase06 -> npm run verify:jira-outbound
npm run verify:phase07 -> npm run verify:admin-ui-acceptance
```

## Manual acceptance cuối Lite

Manual acceptance cuối Lite cần chạy được luồng:

```text
Login
  -> tạo/chọn project
  -> pull Backlog issue theo project
  -> worker ingest vào CIS
  -> mở Issue Editor
  -> nếu cần translation: mở modal Translations, translate/review/Approve + save
  -> approve mapping
  -> mở modal Jira sync để dry-run/chỉnh payload/sync Jira
  -> xem job/journal/anomaly/dashboard
```

Pass cuối cùng khi:

- Không cần thao tác DB thủ công cho luồng chính.
- Lý do block sync hiển thị rõ.
- Sync thật không chạy khi dry-run/pre-check fail.
- Sync lại cùng CIS issue không tạo Jira issue trùng.
- Journal/audit/correlation id có đủ để debug.
