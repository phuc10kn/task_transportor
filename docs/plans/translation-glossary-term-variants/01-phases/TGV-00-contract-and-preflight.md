# TGV-00 — Contract và preflight

## Mục tiêu

Khóa contract canonical/variant, xác nhận database target có thể migrate an toàn và tạo evidence chỉ-đọc trước khi thay schema.

## Artifact mục tiêu

- `docs/plans/translation-glossary-term-variants/00-overview.md`.
- `docs/review/translate-glossary/input.md`.
- `scripts/verify/translation-glossary-preflight.js` — verify-only trên database được chỉ định rõ.
- `package.json` — thêm script `verify:translation-glossary-preflight`, không đưa preflight target vào `npm test`.

## Điều kiện mở phase

- Plan này đã được user chấp thuận về: nhiều source variants, một canonical mỗi language, `term_match_key`, span không chồng lấn và không có target language field trên concept.
- Operator cung cấp đường dẫn tuyệt đối của database target để chạy preflight read-only.
- Migration ledger của database target chưa có `016_translation_glossary_term_variants.sql`.

## Công việc

1. Rà toàn bộ caller/read/write của `translation_glossary_terms`, `is_canonical`, `buildStandardTranslationInput`, `TranslationAdapter`, `ProcessTranslationAdapter`, `codexCliAdapter` và current API payload; không đọc `backlog2jira`.
2. Tạo `verify:translation-glossary-preflight -- --database <absolute-path>`: dùng direct `better-sqlite3` connection với `readonly` và `fileMustExist`, từ chối `:memory:`, temporary verifier path và đường dẫn tương đối; không gọi `createConnection`, `ensureStorage`, `migrate` hoặc WAL pragma và không ghi database.
3. Preflight in evidence gồm database path đã resolve, migration ledger, SQLite version, generated-column support, số concept/term, count theo `(concept, language)`, blank normalized term, collision `(project, language, term_match_key)` tính bằng JavaScript normalization, ID/timestamp/FK integrity và baseline một term mỗi language.
4. Chốt migration 016 dùng primitive generic deterministic trên standard connection, generated non-empty `term_match_key`, giữ `AUTOINCREMENT`/row ID/timestamps và transaction atomic.
5. Đồng bộ `input.md` theo contract đã khóa sau khi preflight pass: source precedence, normalized collision, span selection, canonical prompt và project immutable.

## Checklist nghiệm thu

- [x] Contract canonical/variant, source precedence, Translation ownership, target direction ownership và runtime exact-match đã được ghi rõ.
- [x] Preflight chỉ-đọc nhận database bằng đường dẫn tuyệt đối, từ chối target không an toàn, không gọi connection bootstrap/WAL và không tạo migration ledger mới.
- [x] Evidence có migration ledger, SQLite version/generated-column support, count, blank normalized term, normalized collision, FK integrity và baseline một term mỗi language.
- [x] Migration strategy giữ `AUTOINCREMENT`, ID/timestamps và không sửa migration 015.
- [x] Không có target-language field hay JSON list được đưa vào schema/API.
- [x] Policy conflict, span non-overlap, dedupe/sort/cap 40 và canonical prompt có acceptance đo được.
- [x] `npm run verify:translation-glossary-preflight -- --database <absolute-path>` pass trước schema change.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Kết quả thực hiện

Fix tối thiểu: `scripts/verify/translation-glossary-preflight.js` - thêm preflight read-only theo absolute database path, kiểm tra migration ledger, SQLite generated-column support, baseline, collision chuẩn hóa và FK.
Fix tối thiểu: `package.json` - thêm lệnh `verify:translation-glossary-preflight`.
Fix tối thiểu: `docs/review/translate-glossary/input.md` - đồng bộ contract canonical/variant, normalized key, runtime span selection, migration 016 và UI promote canonical.
