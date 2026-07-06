# Phase 05 - Mapping, anomaly và dry-run Jira

## Mục tiêu

Chặn sync sai trước khi gọi Jira API thật. Phase này tạo mapping required, anomaly tối thiểu và dry-run payload Jira.

## Làm trong phase này

- Tạo module `Mapping`.
- Tạo CRUD/approve/reject mapping rules.
- Tạo required mapping check cho `issue_type`, `status`, `priority`, assignee nếu cần.
- Tạo module `Anomaly`.
- Tạo anomaly `routing_mismatch`, `mapping_gap`, `translation_low_conf`, `unusual_field_change`, `sync_failure_chain`.
- Tạo API ignore/resolve anomaly.
- Tạo module `Jira` phần dry-run payload builder.
- Tạo endpoint `POST /api/v1/issues/:issueId/dry-run/jira`.
- Dry-run validate mapping, config, credential, anomaly và sync state. Trong Issue Editor flow hiện tại, translation review không còn là gate riêng chặn issue canonical sync Jira, nhưng `sync_status = 'pending_translate'` vẫn bị chặn bởi sync-state gate.

## Deliverables

- Module `Mapping` theo [module_structure.md](../../../../architecture/custom_modular_monolith_theory/module_structure.md) và [implement_rules.md](../../../../architecture/custom_modular_monolith_theory/implement_rules.md).
- Module `Anomaly` theo [module_structure.md](../../../../architecture/custom_modular_monolith_theory/module_structure.md) và [implement_rules.md](../../../../architecture/custom_modular_monolith_theory/implement_rules.md).
- Jira dry-run payload builder.
- Mapping required checker.
- Anomaly blocker checker.
- Dry-run endpoint.
- Error codes rõ cho `MAPPING_REQUIRED`, `ANOMALY_BLOCKED`, `JIRA_CONFIG_REQUIRED`, `DRY_RUN_STALE`.
- Test script tự động cho missing mapping, approved mapping, critical anomaly và stale dry-run/canonical hash.

## Chốt chặn

Phase này đạt khi dry-run trả được payload + validation + warnings + `can_sync`, và mọi lỗi block phải ngăn sync thật trước khi Jira API được gọi.

Không đi phase 06 nếu:

- Missing mapping vẫn cho `can_sync = true`.
- Critical anomaly còn open nhưng dry-run pass.
- Dry-run không dùng canonical effective values mới nhất hoặc không phát hiện stale dry-run trước sync.
- Dry-run gọi Jira API thật.
- Lỗi mapping/anomaly không có code rõ cho UI.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [x] Test script tự động của phase 05 pass, ví dụ `npm run verify:phase05`.
- [x] Test dry-run không bị block bởi translation queue/review như gate riêng trong Issue Editor flow.
- [x] Test project tắt/bật `require_translation_review` không làm issue canonical sync phụ thuộc queue dịch; sync state vẫn là gate riêng.
- [x] Test issue thiếu mapping tạo anomaly `mapping_gap`.
- [x] Test missing mapping block dry-run với lỗi rõ.
- [x] Test approve mapping xong dry-run build được payload Jira.
- [x] Test critical anomaly open làm `can_sync = false`.
- [x] Test ignore/resolve anomaly xong dry-run cập nhật trạng thái.
- [x] Test issue dry-run hiện tại không tạo attachment warning vì attachment outbound chưa nối vào Issue Editor flow.
- [x] Test dry-run không gọi Jira API thật.

### Manual check (Người review)

- [x] Gọi dry-run từ API với issue chưa đủ điều kiện và thấy `can_sync = false`.
- [x] Tạo/approve mapping từ API rồi dry-run lại thấy payload Jira.
- [x] Mở anomaly, ignore/resolve, sau đó dry-run lại để kiểm tra trạng thái.
- [x] Xác nhận payload preview và warnings đủ rõ để người vận hành quyết định.

## Ghi chú thiết kế

- Force approve không được bypass missing required mapping.
- Dry-run là hợp đồng bắt buộc trước sync thật.
- Mapping Lite dùng hai bước ở cấp field: giá trị Backlog đã lưu trong CIS được chuẩn hóa sang canonical CIS (`backlog -> cis`), rồi canonical CIS đổi sang giá trị Jira (`cis -> jira`); cả hai rule phải `approved` mới được dùng.
- Dry-run trả lỗi block trong `validation.errors` với code rõ: `MAPPING_REQUIRED`, `ANOMALY_BLOCKED`, `JIRA_CONFIG_REQUIRED`, `DRY_RUN_STALE`.
- Thiếu mapping required tự tạo anomaly `mapping_gap`; anomaly này là warning và không tự block sau khi mapping đã được approve.
- Critical anomaly còn `open` hoặc `investigating` sẽ block dry-run cho tới khi admin `ignore` hoặc `resolve`.
- Attachment chưa download hoặc chưa upload Jira chỉ tạo `warnings` trong Phase 05, chưa block sync.
- `npm run verify:phase05` hiện trỏ tới capability script `npm run verify:mapping-anomaly-dryrun`.
