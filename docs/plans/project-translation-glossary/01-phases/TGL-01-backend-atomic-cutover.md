# TGL-01 — Backend atomic cutover

## Mục tiêu

Trong một phase không thể release từng phần: tạo source of truth normalized, backfill và xóa JSON cũ, cung cấp CRUD API, loại bỏ Project contract cũ và chuyển translation runtime sang bảng mới.

## Artifact mục tiêu

- `src/db/migrations/015_translation_glossary_tables.sql` — new.
- `src/modules/Translation/infrastructure/TranslationGlossaryRepository.js` — new.
- `src/modules/Translation/support/validateTranslationGlossaryInput.js` — new.
- `src/modules/Translation/application/listTranslationGlossary.js` — new.
- `src/modules/Translation/application/createTranslationGlossaryConcept.js` — new.
- `src/modules/Translation/application/updateTranslationGlossaryConcept.js` — new.
- `src/modules/Translation/application/deleteTranslationGlossaryConcept.js` — new.
- `src/modules/Translation/http/controllers/TranslationGlossaryController.js` — new.
- `src/modules/Translation/http/routes.js`.
- `src/modules/Translation/TranslationApi.js`.
- `src/modules/Translation/infrastructure/TranslationContextRepository.js`.
- `src/modules/Translation/application/collectTranslationContext.js`.
- `src/modules/Projects/support/validateProjectInput.js`.
- `src/modules/Projects/support/defaultProjectConfig.js`.
- `src/modules/Projects/infrastructure/ProjectRepository.js`.
- `src/app.js` — verify-only; router hiện được mount tại `/api/v1`.
- `scripts/verify/translation-glossary-migration.js` — new.
- `scripts/verify/translation-glossary-api.js` — new.
- `scripts/verify/translation-glossary-runtime.js` — new.
- `scripts/verify/projects.js`.
- `scripts/verify/translation-review.js`.
- `package.json`.

## Điều kiện mở phase

- TGL-00 có kết quả `No-change` chứa `preflight go` và automated baseline evidence.
- JSON legacy không còn dữ liệu malformed/ambiguous chưa xử lý.
- TGL-00 đã khóa direct `DROP COLUMN` hoặc table-rebuild; executor không tự đổi chiến lược.
- Đã đọc lại `docs/app/05-architecture/01-structure/README.md` và `docs/app/05-architecture/02-boundaries/README.md` trong lượt code.

## Công việc

1. Tạo hai bảng, foreign key, unique constraint và timestamp default theo target design; dùng index sinh bởi hai unique constraint, không tạo secondary index trùng cột.
2. Trong cùng migration transaction, chuẩn hóa mọi `projects.source_language`/`target_language` hiện hữu bằng normal text lowercase; fail nếu giá trị rỗng sau chuẩn hóa, rồi backfill mỗi JSON entry thành concept `default` với key `legacy-<project-id>-<position>` và term theo language config đã chuẩn hóa.
3. Assert count/ambiguity và Project language đã canonical trong migration transaction, sau đó xóa `projects.translation_glossary_json`; failure không được ghi dữ liệu partial.
4. Cài repository CRUD aggregate với transaction cho create/update/delete và query project-scoped ổn định.
5. Cài validator dùng normal text rule; POST/PATCH nhận full aggregate với ít nhất một term; Project languages, API `language_code` và runtime language đều trim/lowercase, không ép regex; duplicate language trong payload trả `422`, storage unique conflict trả `409`.
6. Cài bốn endpoint project-scoped trong Translation router theo status/envelope đã khóa; giữ `PROJECT_NOT_FOUND` từ Projects API, dùng `TRANSLATION_GLOSSARY_NOT_FOUND` cho concept thiếu/cross-project và không trả Project config/credential.
7. Truyền `req.user.id` vào create/update để ghi audit actor; backfill giữ actor `NULL`.
8. Xóa field legacy khỏi defaults, repository serialization/projection và allowed Project fields; request có field legacy trả `422 VALIDATION_ERROR` với `details.field = "translation_glossary_json"`.
9. Chuyển runtime sang query term theo Project; normalize language từ queue item/Project trước query, chỉ materialize concept đủ cặp, preprocessing lọc source-term xuất hiện trong `source_text`, giữ shape prompt và giới hạn 40 term khớp.
10. Cập nhật existing Projects/Translation verifiers và tạo ba verifier glossary riêng; migration verifier phải phủ Project language legacy có chữ hoa/khoảng trắng, API Project sau upgrade trả giá trị canonical và dữ liệu rỗng sau chuẩn hóa làm transaction fail.
11. Thêm các script `verify:translation-glossary-*`, aggregate `verify:translation-glossary`, rồi nối aggregate này vào `verify:phase04`; `npm test` tiếp tục bao phủ glossary qua phase04.
12. Chạy `npm test` sau atomic cutover để chặn regression xuyên Backlog/CIS/Sync/Jira/Admin UI trước khi mở TGL-02.
13. Chạy toàn bộ acceptance của phase. Không coi migration-only, API-only hoặc runtime-only là checkpoint có thể release.

## Checklist nghiệm thu

- [x] Fresh migration tạo đúng hai bảng, constraint và timestamp default; SQLite chỉ có index cần thiết từ unique constraints, không có secondary index trùng cột.
- [x] Upgrade migration chuẩn hóa Project language đã lưu và backfill đủ concept/term/note/group; dữ liệu ambiguous hoặc language rỗng sau chuẩn hóa làm migration fail và không ghi partial.
- [x] Cột `translation_glossary_json` không còn và không có fallback/dual-write.
- [x] Project create/list/get/update vẫn hoạt động sau khi cột cũ bị xóa.
- [x] Project create/update gửi field legacy trả `422` với field detail ổn định.
- [x] CRUD concept `ja`, `vi`, `en` hoạt động và ghi đúng `created_by`/`updated_by`.
- [x] GET/POST/PATCH/DELETE trả đúng `200/201/200/200`, đúng `{data: ...}`; PATCH full-replace terms và DELETE trả `{id, deleted: true}`.
- [x] Payload có ít nhất một term; Project thiếu trả `PROJECT_NOT_FOUND`, concept thiếu/cross-project trả `TRANSLATION_GLOSSARY_NOT_FOUND`, ID sai trả `422 VALIDATION_ERROR`.
- [x] Duplicate language trong payload trả `422`; DB unique race/conflict trả `409 TRANSLATION_GLOSSARY_CONFLICT`.
- [x] Project language cũ trong storage, Project create/update, API language code và runtime queue-item languages cùng normalize bằng `String(...).trim().toLowerCase()`; Project list/get trả giá trị canonical, term/note không bị lowercase.
- [x] Cross-project access trả 404; search/filter/sort luôn scope Project; response không lộ credential.
- [x] Runtime `ja -> vi` và `ja -> en` dùng đúng concept, bỏ concept thiếu cặp, chỉ đưa source-term khớp vào context và giữ giới hạn 40.
- [x] Pending job dùng glossary lúc execution; draft đã tạo không tự đổi.
- [x] `npm run verify:translation-glossary` pass.
- [x] `npm run verify:phase01` pass.
- [x] `npm run verify:phase04` pass và thực sự gọi aggregate glossary.
- [x] `npm test` pass sau backend atomic cutover trước khi mở TGL-02.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Kết quả thực hiện

Fix tối thiểu: src/db/migrations/015_translation_glossary_tables.sql; src/modules/Translation/{infrastructure/TranslationGlossaryRepository.js,support/validateTranslationGlossaryInput.js,application/*Glossary*,http/controllers/TranslationGlossaryController.js,TranslationApi.js,http/routes.js}; src/modules/Projects/{support/defaultProjectConfig.js,support/validateProjectInput.js,infrastructure/ProjectRepository.js}; runtime context cutover; scripts/verify/translation-glossary-{migration,api,runtime}.js; package.json — migration/API/runtime atomic cutover completed; npm test pass
