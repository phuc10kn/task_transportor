# TGL-03 — Docs, verification và handoff

## Mục tiêu

Đồng bộ tài liệu canonical với behavior đã triển khai, materialize đúng ownership glossary và hoàn tất toàn bộ quality gate.

## Artifact mục tiêu

- `docs/app/01-business/README.md`.
- `docs/app/02-product/README.md`.
- `docs/app/03-interface/README.md`.
- `docs/app/05-architecture/README.md`.
- `docs/app/05-architecture/01-structure/modules/MOD-003-translation/README.md`.
- `docs/app/05-architecture/01-structure/modules/MOD-008-projects/README.md`.
- `docs/app/05-architecture/04-state/README.md`.
- `docs/app/05-architecture/04-state/state-owners/SO-007-translation-glossary-state/README.md` — new.
- `docs/app/06-technical/README.md`.
- `docs/app/07-implementation/README.md`.
- `docs/app/08-quality/README.md`.
- `docs/app/09-operation/README.md`.
- `docs/app/10-decisions/README.md`.
- `docs/app/10-decisions/01-decision-making/01-decisions/DEC-002-app-graph-materialization-policy/architecture-clean-baseline.md`.
- `scripts/verify/architecture-clean-baseline.js`.
- `docs/plans/project-translation-glossary/README.md`.
- `docs/plans/project-translation-glossary/01-phases/TGL-03-docs-verification-handoff.md`.

`DF-002` không đổi relation: flow này chuyển CIS context vào Translation, không share glossary state.

## Điều kiện mở phase

- TGL-02 pass và `npm run verify:phase07` pass.
- Backend/UI contract không còn thay đổi.
- Không còn blocker kỹ thuật mở.

## Công việc

1. Cập nhật business/product docs chỉ với behavior/scope glossary; không đưa schema/API/source layout vào business layer.
2. Cập nhật interface docs với màn Translation Glossary, lazy load, CRUD/error/empty behavior.
3. Cập nhật technical docs với hai bảng, migration cutover, endpoint/error/normalization contract.
4. Cập nhật implementation docs với Translation owner files, Projects cleanup, runtime context và verifier wiring.
5. Cập nhật quality docs với automated/manual acceptance; operation docs với operator glossary workflow; decisions docs với cutover/source-of-truth đã chốt.
6. Cập nhật MOD-003 để sở hữu glossary CRUD/context và thêm canonical `owns: SO-007`.
7. Cập nhật MOD-008 để loại glossary khỏi Project integration config ownership.
8. Chạy Type Contract Gate trước khi tạo SO-007:
   `npm run verify:entity-type-contract -- --type docs/meta/01-entity-types/05-architecture/04-state/state-owners/state-owner.md`.
9. Tạo SO-007 với owner Translation, evidence từ repository/API/runtime; không thêm `shared_via DF-002`.
10. Chạy instance gate:
   `npm run verify:entity-type-contract -- --instance docs/app/05-architecture/04-state/state-owners/SO-007-translation-glossary-state/README.md`.
11. Cập nhật architecture state index, architecture summary, DEC-002 clean-baseline record và baseline verifier thành 43 instances/128 edges, có `SO-007` và `MOD-003 --owns--> SO-007` đúng một lần.
12. Chạy `npm run architecture:trace -- --from MOD-003`; lưu evidence kết quả có `MOD-003 --owns--> SO-007` và không có glossary relation tới `DF-002`.
13. Chạy `npm run verify:docs`, `npm run verify:docs-contract`, `npm run verify:entity-instance:architecture`, `npm run verify:relations:architecture`, `npm run verify:references:architecture`, `npm run verify:architecture-baseline` và `npm run verify:architecture-trace`.
14. Chạy `npm run verify:translation-glossary`, `npm run verify:phase01`, `npm run verify:phase04`, `npm run verify:phase07` và `npm test`.
15. Tick checklist/root acceptance có evidence và ghi chỉ `Kết quả thực hiện` của TGL-03. Coordinator cập nhật handoff cuối sau khi phase pass.

## Checklist nghiệm thu

- [x] Docs app không còn mô tả JSON/UI glossary cũ là behavior active.
- [x] Technical ghi schema/API/normalization; Implementation ghi source/runtime/verifier; Operation ghi operator workflow.
- [x] Business/Product không chứa chi tiết schema/API/source layout.
- [x] MOD-003 owns SO-007; MOD-008 không sở hữu glossary state.
- [x] SO-007 pass type/instance/relation/reference gates và không có relation sai tới DF-002.
- [x] Architecture summary, state index, DEC-002 clean baseline và verifier cùng chốt 43 instances/128 edges; `SO-007` và edge ownership xuất hiện đúng một lần.
- [x] `npm run architecture:trace -- --from MOD-003` trả `MOD-003 --owns--> SO-007` và có evidence phục vụ architecture/release review.
- [x] `npm run verify:translation-glossary` pass.
- [x] `npm run verify:phase01` pass.
- [x] `npm run verify:phase04` pass.
- [x] `npm run verify:phase07` pass.
- [x] Toàn bộ docs/architecture command liệt kê trong phase pass.
- [x] `npm test` pass.
- [x] Root automated acceptance đã được tick theo evidence; manual item vẫn để trống.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Kết quả thực hiện

Fix tối thiểu: `docs/app/`, `scripts/verify/architecture-clean-baseline.js`, `scripts/verify/docs-contract.test.js` — đồng bộ behavior glossary, materialize SO-007 ownership `MOD-003 --owns--> SO-007`, cập nhật baseline 43/128 và chạy toàn bộ docs/architecture/translation/phase gates pass; manual acceptance còn chờ người review.
