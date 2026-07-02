# Phase 07 - Admin UI và nghiệm thu Lite

## Mục tiêu

Có Admin UI tối thiểu để vận hành end-to-end và chạy nghiệm thu Lite theo Definition of Done.

## Làm trong phase này

- Login UI.
- Dashboard health.
- Project list/detail/config.
- Issue list/filter.
- Issue list mở vào Issue Editor như màn chính của một issue.
- Issue Editor hiển thị/sửa `CIS CANONICAL`, source data ba nhánh Backlog/CIS/Jira, overview, history và các action vận hành.
- Translation review trong Issue Editor qua nút `Translations`; modal xử lý translate/retranslate, edit text, `Approve + save`, `Reject`.
- Jira sync trong Issue Editor qua nút `Jira sync`; modal chạy dry-run, duplicate payload target, cho sửa field và sync.
- Backlog resync một issue trong Issue Editor qua nút `Resync from Backlog`.
- Issue detail nếu còn tồn tại chỉ là màn phụ/legacy hiển thị original Nhật, draft/reviewed Việt, comments, attachment metadata/status.
- Translation review UI global vẫn có thể tồn tại cho queue, nhưng Issue Editor là luồng chính cho issue translation.
- Mapping settings UI tách 2 luồng `Systems -> CIS` và `CIS -> System`; không dùng form create mapping trực tiếp làm luồng chính.
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
- Issue Editor screen.
- Translation review screens.
- Mapping settings/approval screens.
- Anomaly screens.
- Sync jobs/journal screens.
- Jira sync modal with dry-run result and editable payload.
- Demo guide cho Lite.
- Backup SQLite guide tối thiểu.
- Test script tự động smoke API/UI nếu stack UI hỗ trợ.
- Manual acceptance checklist end-to-end.

## Chốt chặn

Phase này đạt khi một admin có thể dùng UI để chạy toàn bộ luồng: pull một issue Backlog vào CIS, mở Issue Editor, review translation trong modal nếu cần, approve mapping, mở Jira sync modal để dry-run/chỉnh payload/sync Jira, xem journal/anomaly.

Không coi Lite hoàn tất nếu:

- Một bước vận hành bắt buộc chỉ làm được bằng DB/manual script.
- UI không hiển thị lý do block sync.
- Dashboard không thấy pending review nếu bật translation, missing mapping, failed jobs, open anomalies.
- Không có hướng dẫn backup SQLite tối thiểu.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [x] Test script tự động smoke của phase 07 pass nếu UI stack hỗ trợ, ví dụ `npm run verify:phase07`.
- [x] Test login UI bằng admin bootstrap hoặc API smoke tương đương.
- [x] Test project config screen/API smoke tạo/chỉnh được config.
- [x] Test issue list/detail render được dữ liệu seed.
- [x] Test Issue Editor render canonical/source/overview/history.
- [x] Test translation review trong Issue Editor gọi đúng API.
- [x] Test Jira sync modal hiển thị `can_sync`, warnings, payload preview và field editable.
- [x] Test Backlog resync one issue action tồn tại trong Issue Editor.
- [x] Test jobs/journal/anomaly screens render được trạng thái chính.
- [x] Test dashboard count khớp dữ liệu seed/fixture.

### Manual check (Người review)

- [ ] Login UI bằng admin bootstrap.
- [ ] Tạo/chỉnh project config từ UI.
- [ ] Trigger manual pull one issue từ UI.
- [ ] Xem issue mới trong issue list.
- [ ] Mở Issue Editor từ issue list.
- [ ] Nếu cần translation, mở modal `Translations`, translate/retranslate, edit text và `Approve + save`.
- [ ] Cấu hình mapping trong 2 luồng `Systems -> CIS` và `CIS -> System`, sau đó approve mapping từ UI.
- [ ] Mở modal `Jira sync`, thấy dry-run tự chạy và thấy `can_sync`, warnings, payload preview.
- [ ] Sửa một field trong modal Jira sync và trigger sync Jira khi đủ điều kiện.
- [ ] Xem sync job và journal sau sync.
- [ ] Resolve/ignore anomaly từ UI.
- [ ] Đối chiếu dashboard count với dữ liệu trong DB.
- [ ] Chạy manual acceptance checklist end-to-end.

## Nghiệm thu cuối Lite

Lite đạt khi toàn bộ Definition of Done trong `../09-acceptance.md` pass, đặc biệt:

- Manual pull Backlog tạo dữ liệu CIS đúng.
- Nếu bật translation option, `codex_exec` tạo draft dịch và có human review.
- Missing mapping/anomaly block sync thật.
- Dry-run bắt buộc trước Jira sync.
- Sync thật chỉ chạy khi pre-check pass.
- Journal/audit/correlation id đầy đủ.
- Admin UI đủ để vận hành không cần thao tác DB.
