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
- Dry-run validate translation review, mapping, config, credential, anomaly, attachment warning.

## Deliverables

- Module `Mapping` với API boundary.
- Module `Anomaly` với API boundary.
- Jira dry-run payload builder.
- Mapping required checker.
- Anomaly blocker checker.
- Dry-run endpoint.
- Error codes rõ cho `MAPPING_REQUIRED`, `TRANSLATION_REVIEW_REQUIRED`, `ANOMALY_BLOCKED`, `JIRA_CONFIG_REQUIRED`.
- Test script tự động cho missing mapping, approved mapping, critical anomaly và attachment warning.

## Chốt chặn

Phase này đạt khi dry-run trả được payload + validation + warnings + `can_sync`, và mọi lỗi block phải ngăn sync thật trước khi Jira API được gọi.

Không đi phase 06 nếu:

- Missing mapping vẫn cho `can_sync = true`.
- Critical anomaly còn open nhưng dry-run pass.
- Translation chưa approved/edited nhưng dry-run pass.
- Dry-run gọi Jira API thật.
- Lỗi mapping/anomaly không có code rõ cho UI.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] Test script tự động của phase 05 pass, ví dụ `npm run verify:phase05`.
- [ ] Test issue chưa review translation dry-run trả `can_sync = false`.
- [ ] Test issue thiếu mapping tạo anomaly `mapping_gap`.
- [ ] Test missing mapping block dry-run với lỗi rõ.
- [ ] Test approve mapping xong dry-run build được payload Jira.
- [ ] Test critical anomaly open làm `can_sync = false`.
- [ ] Test ignore/resolve anomaly xong dry-run cập nhật trạng thái.
- [ ] Test attachment pending/download failed xuất hiện trong warnings, không block nếu project chưa đánh dấu required.
- [ ] Test dry-run không gọi Jira API thật.

### Manual check (Người review)

- [ ] Gọi dry-run từ API với issue chưa đủ điều kiện và thấy `can_sync = false`.
- [ ] Tạo/approve mapping từ API rồi dry-run lại thấy payload Jira.
- [ ] Mở anomaly, ignore/resolve, sau đó dry-run lại để kiểm tra trạng thái.
- [ ] Xác nhận payload preview và warnings đủ rõ để người vận hành quyết định.

## Ghi chú thiết kế

- Force approve không được bypass missing required mapping.
- Dry-run là hợp đồng bắt buộc trước sync thật.
