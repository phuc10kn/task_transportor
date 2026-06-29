# Phase 07 - Admin UI và nghiệm thu Lite

## Mục tiêu

Có Admin UI tối thiểu để vận hành end-to-end và chạy nghiệm thu Lite theo Definition of Done.

## Làm trong phase này

- Login UI.
- Dashboard health.
- Project list/detail/config.
- Issue list/filter.
- Issue detail hiển thị original Nhật, draft/reviewed Việt, comments, attachment metadata/status.
- Translation review UI.
- Mapping approval UI.
- Anomaly list/detail UI.
- Sync jobs UI.
- Sync journal UI.
- Dry-run Jira result UI.
- Kiểm tra error/loading/empty states tối thiểu.
- Viết hướng dẫn chạy demo Lite.

## Deliverables

- Admin UI login.
- Dashboard health/counts.
- Project config screens.
- Issue list/detail screens.
- Translation review screens.
- Mapping approval screens.
- Anomaly screens.
- Sync jobs/journal screens.
- Dry-run result screen.
- Demo guide cho Lite.
- Backup SQLite guide tối thiểu.
- Test script tự động smoke API/UI nếu stack UI hỗ trợ.
- Manual acceptance checklist end-to-end.

## Chốt chặn

Phase này đạt khi một admin có thể dùng UI để chạy toàn bộ luồng: pull Backlog, review translation, approve mapping, dry-run, sync Jira, xem journal/anomaly.

Không coi Lite hoàn tất nếu:

- Một bước vận hành bắt buộc chỉ làm được bằng DB/manual script.
- UI không hiển thị lý do block sync.
- Dashboard không thấy pending review, missing mapping, failed jobs, open anomalies.
- Không có hướng dẫn backup SQLite tối thiểu.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] Test script tự động smoke của phase 07 pass nếu UI stack hỗ trợ, ví dụ `npm run verify:phase07`.
- [ ] Test login UI bằng admin bootstrap hoặc API smoke tương đương.
- [ ] Test project config screen/API smoke tạo/chỉnh được config.
- [ ] Test issue list/detail render được dữ liệu seed.
- [ ] Test translation review action gọi đúng API.
- [ ] Test dry-run result hiển thị `can_sync`, warnings, payload preview.
- [ ] Test jobs/journal/anomaly screens render được trạng thái chính.
- [ ] Test dashboard count khớp dữ liệu seed/fixture.

### Manual check (Người review)

- [ ] Login UI bằng admin bootstrap.
- [ ] Tạo/chỉnh project config từ UI.
- [ ] Trigger manual pull từ UI.
- [ ] Xem issue mới trong issue list.
- [ ] Review/approve/edit translation từ UI.
- [ ] Tạo/approve mapping từ UI.
- [ ] Dry-run từ UI và thấy `can_sync`, warnings, payload preview.
- [ ] Trigger sync Jira từ UI khi đủ điều kiện.
- [ ] Xem sync job và journal sau sync.
- [ ] Resolve/ignore anomaly từ UI.
- [ ] Đối chiếu dashboard count với dữ liệu trong DB.
- [ ] Chạy manual acceptance checklist end-to-end.

## Nghiệm thu cuối Lite

Lite đạt khi toàn bộ Definition of Done trong `../09-acceptance.md` pass, đặc biệt:

- Manual pull Backlog tạo dữ liệu CIS đúng.
- `codex_exec` tạo draft dịch và có human review.
- Missing mapping/anomaly block sync thật.
- Dry-run bắt buộc trước Jira sync.
- Sync thật chỉ chạy khi pre-check pass.
- Journal/audit/correlation id đầy đủ.
- Admin UI đủ để vận hành không cần thao tác DB.
