# TGL-00 — Contract và preflight

## Mục tiêu

Khóa contract triển khai và chứng minh dữ liệu JSON hiện hữu có thể cutover an toàn trước khi sửa schema.

## Artifact mục tiêu

- `docs/review/translate-glossary/input.md` — verify-only; phát hiện mâu thuẫn thì block và quay lại planner, không sửa trong executor phase.
- `docs/plans/project-translation-glossary/01-phases/TGL-00-contract-and-preflight.md` — ghi checklist và kết quả preflight.
- `src/db/migrations/003_translation_glossary.sql` — verify-only.
- `src/modules/Projects/support/validateProjectInput.js` — verify-only.
- `src/modules/Projects/support/defaultProjectConfig.js` — verify-only.
- `src/modules/Projects/infrastructure/ProjectRepository.js` — verify-only.
- `src/modules/Translation/infrastructure/TranslationContextRepository.js` — verify-only.
- `src/modules/Translation/application/collectTranslationContext.js` — verify-only.
- `scripts/verify/projects.js`, `scripts/verify/translation-review.js`, `scripts/verify/admin-ui-acceptance.js` — verify-only.
- Database local/test chứa Project hiện hữu — read-only inventory.

## Điều kiện mở phase

- Plan ở trạng thái `Planned`.
- Phase hiện tại trong handoff là `TGL-00`.
- Đã đọc source of truth bắt buộc và boundary docs cho Projects/Translation.

## Công việc

1. Rà toàn bộ caller/read/write của `translation_glossary_json`, không đọc `backlog2jira`.
2. Inventory JSON thực tế: parse errors, shape khác chuẩn, entry trống, ngôn ngữ thiếu/trùng và count theo Project.
3. Đối chiếu và xác nhận schema, normalization, aggregate PATCH semantics, API/error contract và runtime materialization đã khóa trong overview; phát hiện lệch thì `no-go` và quay lại planner, không tự sửa contract trong executor.
4. Chạy `SELECT sqlite_version()` và probe `ALTER TABLE ... DROP COLUMN` trên scratch table bằng đúng SQLite runtime hiện tại để khóa một chiến lược: direct `DROP COLUMN` hoặc table-rebuild. Không viết migration `015` trong phase verify-only này.
5. Chạy `npm run verify:phase01`, `npm run verify:phase04` và `npm run verify:phase07`; phân loại failure có trước.
6. Nếu pass, ghi đúng một dòng `No-change: docs/plans/project-translation-glossary/01-phases/TGL-00-contract-and-preflight.md - preflight go; inventory=<project_id:entries/concepts/terms,...>; totals=<projects/entries/concepts/terms>; anomalies=0; sqlite=<version>; drop_strategy=<direct_drop|table_rebuild>; baseline=<phase01/phase04/phase07>`. Chỉ lưu ID và count, không lưu term, credential hoặc raw JSON. Nếu blocked, ghi `In-progress: TGL-00 - preflight no-go: <blocker> | Next: planner.md`. Coordinator cập nhật handoff sau đó.

## Checklist nghiệm thu

- [x] Tất cả read/write của field legacy đã được liệt kê.
- [x] `Kết quả thực hiện` lưu compact inventory theo từng Project cùng totals; chỉ chứa ID/count, không chứa raw glossary hoặc credential.
- [x] Không có dữ liệu malformed hoặc ambiguous chưa có cách xử lý rõ.
- [x] Contract normalization/API/error/runtime/UI đã khóa, không còn wording mơ hồ.
- [x] Scratch-table probe đã xác nhận chiến lược xóa cột tương thích SQLite runtime mà không tạo migration `015` trong TGL-00.
- [x] `npm run verify:phase01`, `npm run verify:phase04` và `npm run verify:phase07` pass hoặc có baseline failure được ghi rõ.
- [x] `Kết quả thực hiện` dùng đúng format canonical: `No-change` chứa `preflight go`, inventory/totals/anomalies/SQLite/drop strategy/baseline evidence, hoặc `In-progress` chứa `preflight no-go` và blocker.
- [ ] Unit test check (Agent).
- [ ] Manual check (Người review).

## Kết quả thực hiện

No-change: docs/plans/project-translation-glossary/01-phases/TGL-00-contract-and-preflight.md - preflight go; inventory=1:entries0/concepts0/terms0,2:entries0/concepts0/terms0,3:entries0/concepts0/terms0; totals=projects3/entries0/concepts0/terms0; legacy_callers8; anomalies=malformed0/ambiguous0/empty0/missing_language0/duplicate_language0; sqlite=3.53.2; drop_strategy=direct_drop; baseline=phase01/phase04/phase07 pass
