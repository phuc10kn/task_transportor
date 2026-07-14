# Plan — Project Translation Glossary

> Ngày lập: 2026-07-14  
> Trạng thái: Automated implementation complete — chờ manual acceptance
> Scope: Lite, glossary theo Project, hỗ trợ nhiều ngôn ngữ

## Mục tiêu

Thay `projects.translation_glossary_json` bằng mô hình glossary chuẩn hóa do Translation module sở hữu, cung cấp một màn **Translation Glossary** riêng và dùng dữ liệu mới khi tạo translation context.

Plan này là cutover dứt điểm: dữ liệu cũ được backfill rồi cột JSON và contract cũ bị loại bỏ. Không có dual-write, fallback hoặc hai UI chạy song song.

Chi tiết: [Overview](00-overview.md).

## Phạm vi

Bao gồm migration hai bảng, CRUD API project-scoped, runtime context đa ngôn ngữ, Admin UI mới, loại bỏ glossary khỏi Project config và cập nhật tài liệu/verification liên quan.

Không bao gồm glossary global, import/export, version history, bulk edit, tự động retranslate hoặc split-pane.

## Baseline hiện tại

- Project đang lưu `translation_glossary_json`.
- Translation context đang đọc JSON này và materialize cặp `source`/`target`.
- Admin UI chưa có màn quản lý glossary riêng.
- Các verify hiện tại còn seed và assert contract JSON cũ.

Chi tiết và evidence: [Overview](00-overview.md).

## Source of truth

Thứ tự ưu tiên khi triển khai:

1. `AGENTS.md`.
2. `docs/app/02-product/README.md` và các quyết định còn hiệu lực trong `docs/app/10-decisions/README.md`.
3. `docs/app/05-architecture/**` cho ownership và module boundary.
4. [Input review đã chốt](../../review/translate-glossary/input.md) cho contract glossary.
5. Code, migration và verify hiện tại là baseline evidence, không ghi đè quyết định đã chốt.

## Phase triển khai

| Thứ tự | Phase | Phụ thuộc | Kết quả bắt buộc |
| --- | --- | --- | --- |
| 1 | [TGL-00 — Contract và preflight](01-phases/TGL-00-contract-and-preflight.md) | Không | Khóa contract và kiểm tra dữ liệu trước cutover. |
| 2 | [TGL-01 — Backend atomic cutover](01-phases/TGL-01-backend-atomic-cutover.md) | TGL-00 pass | Migration, API, Projects cleanup và runtime chuyển nguồn trong một phase không thể release từng phần. |
| 3 | [TGL-02 — Admin UI](01-phases/TGL-02-admin-ui.md) | TGL-01 pass | Một màn Translation Glossary mới thay UI/config cũ. |
| 4 | [TGL-03 — Docs, verify và handoff](01-phases/TGL-03-docs-verification-handoff.md) | TGL-02 pass | Tài liệu canonical và toàn bộ quality gate đồng bộ. |

Chỉ một phase được active. Executor không bắt đầu phase sau trước khi checklist tự động của phase hiện tại pass và `Kết quả thực hiện` đã được ghi.

## Điều phối

Snapshot current phase, blocked state, accepted gaps và resume rules chỉ có một source tại [02-coordination.md](02-coordination.md).

## Checklist nghiệm thu tổng

- [x] Dữ liệu JSON cũ được backfill có kiểm chứng và `projects.translation_glossary_json` không còn tồn tại.
- [x] Project language đã lưu được chuẩn hóa thành normal text lowercase; giá trị rỗng sau chuẩn hóa làm migration fail atomic.
- [x] Hai bảng mới là source of truth duy nhất; không có fallback hoặc dual-write.
- [x] CRUD scope theo `project_id`, không trả credential Project.
- [x] API write trả đúng status/envelope đã khóa; full aggregate có ít nhất một term và error code ổn định.
- [x] Mỗi concept hỗ trợ số lượng ngôn ngữ linh hoạt và chặn trùng language trong cùng concept.
- [x] Runtime chỉ materialize concept có đủ term cho cặp ngôn ngữ đang dịch.
- [x] Project create/update gửi field legacy nhận validation error ổn định.
- [x] Admin UI có một màn Translation Glossary mới; Project Config không còn glossary.
- [x] Translation Glossary dùng compact table và modal hiện có; không có drawer/layout thứ hai.
- [x] Existing Translation Queue và các luồng Translation cũ vẫn pass verify.
- [x] Docs interface, architecture, technical, implementation, quality, operation và decision được cập nhật đúng layer.
- [x] Architecture baseline có 43 instances/128 edges và trace từ MOD-003 chứng minh `MOD-003 --owns--> SO-007`.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Điều kiện hoàn thành

Plan hoàn thành khi `TGL-00` đến `TGL-03` đều có kết quả thực hiện hợp lệ, toàn bộ automated gate đã pass, không còn blocker mở, và user xác nhận manual acceptance cho UI/cutover.
