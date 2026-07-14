# TGV-02 — Admin UI, docs và handoff

## Mục tiêu

Cho operator quản lý canonical/variants rõ ràng, đồng bộ docs canonical và hoàn tất handoff manual acceptance.

## Artifact mục tiêu

- `public/admin/app.js`.
- `public/admin/styles.css`.
- `scripts/verify/admin-ui-acceptance.js`.
- `docs/app/02-product/README.md`.
- `docs/app/03-interface/README.md`.
- `docs/app/05-architecture/01-structure/modules/MOD-003-translation/README.md`.
- `docs/app/05-architecture/04-state/state-owners/SO-007-translation-glossary-state/README.md`.
- `docs/app/06-technical/README.md`.
- `docs/app/07-implementation/README.md`.
- `docs/app/08-quality/README.md`.
- `docs/app/09-operation/README.md`.
- `docs/app/10-decisions/README.md`.
- `docs/plans/translation-glossary-term-variants/README.md`.
- `docs/plans/translation-glossary-term-variants/01-phases/TGV-02-admin-ui-docs-handoff.md`.
- `docs/plans/translation-glossary-term-variants/02-coordination.md`.

## Điều kiện mở phase

- TGV-01 automated gate pass, gồm `npm test`; `Manual check (Người review)` của TGV-01 vẫn để trống đến khi user xác nhận.
- API aggregate, normalized conflict và runtime canonical contract `is_canonical` đã ổn định.

## Công việc

1. Đổi modal thành language sections: một radio canonical trong mỗi section, term variants động, add/remove language/variant và giữ input khi API 422/409.
2. Implement local promote: chọn variant atomically demote canonical cũ; chỉ cho xóa canonical sau khi promote term khác hoặc xóa toàn bộ language section.
3. Hiển thị count variants ở table, canonical trước variants ở view modal; giữ lazy-load, filter/search/error/retry và Translation Queue độc lập.
4. Mở rộng Admin UI acceptance cho canonical promote, add/remove variants, normalized conflict cross-concept, validation, compact/hẹp viewport và không hard-code language.
5. Đồng bộ docs/app: source precedence, direction ở Project/queue, `term_match_key` internal, canonical target, source variants, migration 016, span runtime match, process prompt và operator workflow.
6. Chạy chính xác `npm run verify:phase07`, `npm run verify:docs`, `npm run verify:docs-contract`, `npm run verify:entity-type-contract`, `npm run verify:entity-instance:architecture`, `npm run verify:relations:architecture`, `npm run verify:references:architecture`, `npm run verify:architecture-baseline`, `npm run verify:architecture-trace` và `npm test`.
7. Tick checklist/root acceptance theo evidence; manual item để trống; coordinator cập nhật handoff cuối.

## Checklist nghiệm thu

- [x] UI tạo được `ja` canonical + nhiều ja variants và một `vi` canonical trong cùng concept.
- [x] Chọn variant làm canonical atomically demote canonical cũ; UI không cho save khi một language thiếu canonical hoặc có nhiều canonical.
- [x] UI không mất input sau 422/409 và hiển thị rõ normalized conflict khi term đã thuộc concept khác cùng Project/language.
- [x] Table/view phân biệt canonical và variants, language dynamic, viewport hẹp vẫn dùng được.
- [x] Translation Queue và Project Config không bị thay đổi ownership/UI glossary.
- [x] Docs không mô tả one-term-per-language là behavior active; docs mô tả `term_match_key` là internal và Project giữ translation direction.
- [x] Các lệnh docs/architecture đã liệt kê trong công việc 6 pass.
- [x] `npm run verify:phase07` pass.
- [x] `npm test` pass.
- [x] Root automated acceptance đã tick theo evidence; manual item vẫn để trống.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Kết quả thực hiện

- Đã đổi editor sang language sections động: mỗi section có language code, một radio canonical, add/remove variant và add/remove language; view phân biệt canonical/variant.
- Đã cập nhật product/interface/technical/implementation/quality/operation/decision/architecture docs theo canonical/variant và migration 016.
- Evidence: `npm run verify:phase07`, toàn bộ docs/architecture gates và `npm test` pass.
