# 04 - Domain

`04-domain/` mô tả business meaning cốt lõi và mô hình khái niệm mà hệ thống dùng để hiểu domain. File này giữ vocabulary, entity, lifecycle và invariant hiện tại của Central Sync Hub.

## Nguồn hướng dẫn

- Entity model: `docs/guide/concepts/entity-model.md`
- Relation model: `docs/guide/concepts/relation-model.md`
- Cách trace impact: `docs/guide/workflows/trace-impact.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#04-domain`
- Canonical map: `docs/guide/reference/canonical-map.md`

## Domain Truth Hiện Tại

Vocabulary còn sống:

- `CIS`: core/hub giữ issue theo ngữ cảnh vận hành.
- `Source snapshot`: dữ liệu gốc lấy từ Backlog/Jira, không bị manual edit ghi đè.
- `Canonical data`: dữ liệu vận hành hiện tại trong CIS, dùng để review, prepare và publish.
- `Target preview`: payload preview/dry-run sẽ ghi sang Jira nếu được approve.
- `Translation review`: quá trình tạo draft, review, approve/edit/reject bản dịch.
- `Mapping`: rule chuyển giá trị giữa source, canonical CIS và target.
- `Anomaly`: tín hiệu bất thường cần đánh giá, khác với error kỹ thuật thuần.
- `Sync journal`: lịch sử xử lý inbound/outbound để audit và recovery.
- `Retry`: chạy lại một bước đã fail sau khi hiểu nguyên nhân, khác với re-ingest.

Domain concepts/entities chính:

- `Project`: đơn vị cấu hình vận hành, gắn nguồn Backlog, đích Jira, policy translation/mapping/sync và trạng thái bật/tắt sync.
- `Issue`: đối tượng vận hành trung tâm trong CIS; nối source snapshot, canonical data, translation, mapping, anomaly, sync job và journal.
- `Comment`: trao đổi đi kèm issue; cần translation/review trước outbound khi policy yêu cầu.
- `Attachment`: file/metadata gắn với issue/comment; download và outbound sync có lifecycle riêng.
- `Translation`: reviewed text chỉ có giá trị downstream sau approve/manual edit.
- `Mapping`: approved mapping mới được dùng như rule outbound đáng tin cậy.
- `Anomaly`: open/investigating/ignored/resolved là quyết định vận hành.
- `Sync job`: hàng đợi xử lý nội bộ.
- `Sync journal`: audit trail của quyết định và kết quả xử lý.

Lifecycle/domain state quan trọng:

- Issue: mới vào CIS -> đang review/prepare -> sẵn sàng preview -> sẵn sàng sync -> đã sync -> cần cập nhật lại / conflict / block.
- Translation: chưa cần dịch -> có draft -> đang review -> approved/edited/rejected -> stale khi source/context đổi.
- Anomaly: open -> investigating -> ignored/resolved.
- Sync job: pending -> running -> success/failed/cancelled/retry scheduled.
- Attachment: download pending/downloaded/failed/skipped và sync pending/synced/skipped/failed là hai lifecycle riêng.

Domain invariants/gates:

- Source snapshot không bị ghi đè bởi manual canonical edit.
- Canonical branch là input chính cho Issue Editor và Jira outbound.
- Target preview/dry-run stale sau canonical change.
- Issue chưa publish-ready nếu còn missing required mapping, critical/open anomaly, stale dry-run, config thiếu, credential thiếu.
- Comment cần dịch không sync outbound khi reviewed translation chưa sẵn sàng.
- Mapping gap block outbound tới khi có approval; decision accepted rõ mới được thay đổi rule này.
- Attachment failure được xử lý riêng, trừ khi project sau này đánh dấu attachment là required.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#04-domain`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ domain vocabulary, concept, lifecycle và invariant đang áp dụng cho Central Sync Hub.

Chỉ mục nhanh:

- `01-language/`
- `02-model/`
- `03-rules/`
- `04-behavior/`
- `05-lifecycle/`

## Theory Routing

- `TH-CANON`: canonical truth, source snapshot, reviewed state, read model và owner state.
- `TH-MODULAR`: domain boundary gắn với owner capability và aggregate ownership.
- `TH-SYNC-SAFE`: readiness, stale preview và publish safety.
- `TH-OPS-TRACE`: journal, retry, anomaly và recovery meaning.

## Rule Riêng Hiện Tại

- Source snapshot, canonical CIS data và target preview là ba meaning khác nhau; không gộp trong Domain.
- Domain meaning không được đổi chỉ để khớp schema, API, source layout hiện tại.
- Thay đổi invariant/gate như mapping gap, anomaly block, stale preview phải trace tới Product/Decision liên quan.
- UI, Technical và Implementation chỉ hiện thực/trình bày domain meaning, không tự tạo domain rule mới.
