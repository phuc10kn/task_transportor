# TGV-01 — Atomic schema, API và runtime

## Mục tiêu

Thay unique một-term-per-language bằng canonical/variant terms trong một cutover atomic, rồi dùng source variants và target canonical nhất quán ở mọi translation transport.

## Artifact mục tiêu

- `src/infrastructure/database/connection.js`.
- `src/db/migrations/016_translation_glossary_term_variants.sql`.
- `src/modules/Translation/support/validateTranslationGlossaryInput.js`.
- `src/modules/Translation/application/createTranslationGlossaryConcept.js`.
- `src/modules/Translation/application/updateTranslationGlossaryConcept.js`.
- `src/modules/Translation/infrastructure/TranslationGlossaryRepository.js`.
- `src/modules/Translation/application/collectTranslationContext.js`.
- `src/modules/Translation/application/buildStandardTranslationInput.js`.
- `src/modules/Translation/infrastructure/TranslationAdapter.js`.
- `src/modules/Translation/infrastructure/ProcessTranslationAdapter.js`.
- `src/infrastructure/ai/codexCliAdapter.js`.
- `scripts/verify/translation-glossary-migration.js`.
- `scripts/verify/translation-glossary-api.js`.
- `scripts/verify/translation-glossary-runtime.js`.
- `scripts/verify/translation-review.js`.
- `scripts/verify/fakes/codex-exec.js`.

## Điều kiện mở phase

- TGV-00 automated gate pass; `Manual check (Người review)` của TGV-00 vẫn để trống đến khi user xác nhận.
- Preflight inventory không có data blocker và xác nhận database target hỗ trợ generated column.
- Không có caller ngoài scope cần giữ payload term thiếu `is_canonical`.

## Công việc

1. Đăng ký `normalize_text_key(value)` deterministic tại standard SQLite connection. Hàm là primitive generic không import domain, dùng đúng `String(value ?? "").trim().toLowerCase()`; Translation áp dụng nó cho `term_match_key`, migration, repository và verifier dùng cùng semantics.
2. Tạo migration 016 table rebuild giữ `AUTOINCREMENT`, thêm generated stored non-empty `term_match_key`, unique `(concept, language, term_match_key)`, partial unique canonical, trigger term `BEFORE INSERT`/`BEFORE UPDATE OF glossary_concept_id, language_code, term` với marker conflict và trigger concept làm `project_id` immutable; preserve ID/timestamps/FK/cascade.
3. Thay validation payload: mọi term có boolean `is_canonical`; derive `term_match_key`; group mỗi language có đúng một canonical; duplicate payload tính theo `(language_code, term_match_key)`; validation full aggregate cùng PATCH transaction bảo đảm ít nhất một canonical mỗi language.
4. Map marker term trigger và unique race term sang `409 TRANSLATION_GLOSSARY_CONFLICT` với `details.field = "terms"`. Giữ unique `(project_id, group_key, concept_key)` là conflict riêng với `details.field = "concept_key"`; không map mọi `SQLITE_CONSTRAINT_UNIQUE` vào một lỗi.
5. Thay repository aggregate read/write/sort/search để trả và lưu variants nhưng không lộ `term_match_key`. Public update không đổi `project_id`; direct SQL update bị trigger chặn.
6. Thay runtime query: source join tất cả terms của source language, target join chỉ `is_canonical = 1`. `prepareGlossaryForContext` scan span source không chồng lấn, dedupe theo `(concept, target_language)`, sort deterministic rồi cap 40 theo overview.
7. Thay `buildStandardTranslationInput` bằng hard instruction dùng chính xác target canonical khi glossary match. `TranslationAdapter` render instruction thành mandatory block trước context JSON. `ProcessTranslationAdapter` phải truyền request JSON nguyên vẹn. Bundled `codexCliAdapter` bỏ instruction glossary chung và render `request.instructions` nguyên văn; infrastructure không tự tạo glossary policy mới.
8. Mở rộng verifier theo ownership sau: migration verifier chỉ cover fresh và upgrade 015 -> 016; API verifier cover aggregate/collision/error mapping; runtime verifier cover source matching/span/dedupe/cap; review verifier cover chat prompt, process stdin và bundled adapter prompt.
9. Migration verifier dựng fixture bằng cách apply đến 015, insert concept/term có ID/timestamp xác định, rồi chỉ apply 016. Verify success preserve schema/data và failure normalized collision rollback: table schema 015, rows và `schema_migrations` không đổi.
10. Chạy `npm run verify:translation-glossary`, `npm run verify:translation-review`, `npm run verify:phase04`, `npm run verify:phase01` và `npm test`.

## Checklist nghiệm thu

- [x] Connection đăng ký primitive deterministic generic trước migration/read/write; generated non-empty key dùng đúng JavaScript normalization gồm Unicode case test.
- [x] Migration fresh/upgrade pass; terms cũ giữ `AUTOINCREMENT`, ID/text/timestamp và được canonical.
- [x] Fixture upgrade 015 -> 016 pass; normalized collision failure giữ nguyên schema 015, data và migration ledger.
- [x] DB chặn duplicate `(concept, language, term_match_key)`, nhiều canonical trong một language và đổi `concept.project_id`; validation/transaction chặn language không có canonical.
- [x] DB trigger chặn normalized source-term collision xuyên concept cho cả insert/update; API map term conflict `409` khác concept-key conflict.
- [x] API create/update/get trả `is_canonical`, không nhận/trả `term_match_key`, chặn invalid canonical group bằng `422` và conflict race bằng `409`.
- [x] Runtime `ja` variants cùng concept đều map sang một `vi` canonical; span overlap chỉ giữ match dài nhất; context dedupe/sort xác định trước cap 40.
- [x] Runtime direction đảo dùng source variants của language mới và canonical target tương ứng.
- [x] Không match source variant thì context không có entry; `note` không match; cap là 40 sau span selection, dedupe và sort.
- [x] Chat prompt, process stdin và bundled `codex_exec` prompt có hard instruction dùng chính xác target canonical khi glossary match.
- [x] Pending item dùng variants/canonical mới nhất; draft đã có không tự đổi.
- [x] `npm run verify:translation-glossary` pass.
- [x] `npm run verify:translation-review` pass.
- [x] `npm run verify:phase04` pass.
- [x] `npm test` pass.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Kết quả thực hiện

- Đã đăng ký `normalize_text_key` deterministic ở standard SQLite connection và thêm migration 016 atomic với generated key, canonical partial unique index, collision triggers và project immutability trigger.
- Đã cho phép nhiều variants theo từng language, bắt buộc đúng một canonical/language, giữ `term_match_key` internal và map conflict term riêng khỏi conflict concept.
- Đã cập nhật runtime chọn source variants, target canonical, matching span không chồng lấn, dedupe/sort trước cap 40; prompt chat/process/bundled adapter nhận hard instruction từ request.
- Evidence: `npm run verify:translation-glossary`, `npm run verify:translation-review`, `npm run verify:phase04`, `npm run verify:phase01`, `npm test` đều pass.
