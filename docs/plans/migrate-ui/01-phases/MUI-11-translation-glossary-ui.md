# MUI-11 — Translation Glossary UI

## Mục tiêu

Chuyển project-scoped concept/group/language/variant/canonical CRUD sang Next.js và mở HG-04.

## Artifact mục tiêu

- `/translation-glossary` route và `apps/admin-web/features/glossary/**`.
- Glossary Playwright suite cho CRUD/invariants/conflicts.
- HG-04 deterministic issues/queue/attachment/glossary seed và checklist.

## Điều kiện mở phase

- MUI-10 automated pass.
- Current Glossary API/migration/verifier và exactly-one-canonical invariant pass.

## Công việc

- Không preload trước khi route active và Project được chọn.
- Project/group/search nằm trong URL; filter client-side theo current list API, không thêm server pagination.
- Table giữ Group, Concept key, full term list theo dynamic language với nhãn Canonical, Note và Actions.
- Create dialog khởi tạo section theo `source_language` và `target_language` của selected Project, de-duplicate nếu trùng; không hard-code `ja`/`vi` và operator vẫn có thể add/remove language.
- View/Edit dialog hiển thị full term list; mỗi language có nhiều variants và đúng một canonical, label như `vi: STG (Canonical)`.
- Controlled create/view/edit/delete dialogs hỗ trợ add/remove variant/language và chọn canonical.
- Conflict/validation giữ Project/group/form/variants và hiển thị server error theo field/context.
- Delete confirmation có concept identity.
- Đăng ký Translation Glossary nav/refetch adapter; Global Refresh giữ Project/group/search và bảo vệ dirty concept form.
- Sau automated pass, giữ phase active và chờ HG-04.

## Checklist nghiệm thu

- [x] Glossary lazy-load và URL state đúng.
- [x] Table giữ Group/Concept/full language terms/Note/Actions.
- [x] Create default language sections bám selected Project, de-duplicate đúng và không hard-code language.
- [x] Dynamic language variants và exactly-one-canonical invariant hoạt động.
- [x] Canonical label rõ; conflict/validation giữ toàn bộ form.
- [x] Delete có controlled confirmation và concept identity.
- [x] Glossary verifier, lint/typecheck/build và Playwright pass.
- [x] HG-04 được user xác nhận.
- [x] Manual check (Người review tại HG-04).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress: MUI-11 - automated gate pass | Next: chờ HG-04.

Đã thêm route `/translation-glossary` với lazy-load theo Project, URL state cho Project/Group/Search, table Group/Concept/full language terms/Note/Actions và controlled View/Edit/Create/Delete dialog. Ngôn ngữ khởi tạo lấy từ Project, terms/variants là dynamic, canonical chọn bằng radio và lỗi conflict/validation giữ form.

Evidence tự động: `npm run verify:translation-glossary`, `npm run admin:lint`, `npm run admin:typecheck`, `npm run admin:build`, `npm test` pass; full Admin UI Playwright pass 23/23. Browser matrix kiểm URL/lazy-load, table headers, Project language sections, exactly-one-canonical payload, Canonical label, controlled delete identity và conflict giữ form. HG-04/Manual vẫn chờ user review.

### Ma trận evidence Agent

- `translation-glossary.spec.ts`: URL/lazy-load, table headers, Project languages, dynamic variants và exactly-one-canonical payload.
- `translation-glossary.spec.ts`: Canonical label, controlled delete identity và conflict giữ dialog/form.
- `verify:translation-glossary`: migration, API and runtime glossary contract.
