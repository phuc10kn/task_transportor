# Overview — Translation Glossary Term Variants

## Mục tiêu nghiệp vụ

Một concept biểu diễn một ý nghĩa ổn định. Operator có thể khai báo nhiều text diễn đạt ý nghĩa đó trong cùng language để runtime nhận diện source text, nhưng mỗi language chỉ có một text canonical để dùng làm target translation.

Ví dụ concept `facility_all`:

```text
ja
- canonical: 全施設
- variant: 全ての施設
- variant: すべての館

vi
- canonical: toàn bộ cơ sở
```

Khi dịch `ja -> vi`, source matcher nhận cả ba text tiếng Nhật. Entry đưa vào AI context luôn có target `toàn bộ cơ sở`.

## In scope

- Nhiều term rows cho một `(concept, language_code)`.
- Flag `is_canonical` để chọn duy nhất một output term cho mỗi language.
- Exact substring matching không phân biệt hoa/thường trên toàn bộ source variants.
- Migration `016_translation_glossary_term_variants.sql` rebuild bảng term trong transaction.
- Full-replace CRUD API, Admin UI và verifier cập nhật theo contract variants.

## Out of scope

- `target_translate_languages` trên concept.
- Fuzzy matching, morphology, tokenization theo từ điển, regex tùy ý hoặc AI tự suy luận synonym.
- Glossary global/shared, import/export, version history, bulk edit hoặc tự động retranslate draft cũ.
- Nhiều target canonical trong cùng một language.

## Source precedence và architecture decision

Thứ tự ưu tiên khi nguồn mâu thuẫn:

1. `AGENTS.md` quyết định luật repository, Lite scope, migration, test và module boundary.
2. `docs/app/02-product/README.md` và `docs/app/10-decisions/README.md` quyết định product scope và quyết định còn hiệu lực.
3. `docs/app/05-architecture/**` quyết định ownership, public boundary và AI boundary.
4. File này quyết định contract canonical/variant, data, API, runtime, migration và UI cho plan này.
5. `docs/review/translate-glossary/input.md` là design provenance; TGV-00 đồng bộ nó sau khi preflight pass.
6. Code, schema và verifier hiện tại chỉ là evidence baseline.

Nguồn ở mức thấp không được ghi đè nguồn ở mức cao. Khi nguồn mức 1 đến 3 mâu thuẫn với contract dưới đây, quay về `planner.md`, sửa plan trước và không triển khai.

Translation sở hữu migration 016, state `translation_glossary_concepts`/`translation_glossary_terms`, API glossary, validation, repository, runtime context và nghĩa nghiệp vụ của prompt glossary. Projects chỉ sở hữu `source_language`/`target_language`; queue chọn direction khi dịch. Không module nào ngoài Translation ghi trực tiếp glossary tables hoặc gọi Translation repository. HTTP/Admin UI đi qua public API của Translation. `src/infrastructure/ai` chỉ vận chuyển request/instruction đã chuẩn bị, không tự quyết định canonical hay matching policy.

## Quyết định đã khóa

1. Translation direction vẫn lấy từ queue item/Project. Concept không có field target language riêng.
2. Mọi language group của một concept có đúng một `is_canonical = true`; canonical là text runtime dùng khi language đó là target.
3. Các term còn lại là source variants. Khi language đó là source, runtime quét cả canonical lẫn variants.
4. `term_match_key` là `String(value ?? "").trim().toLowerCase()`. Runtime normalize source text bằng `String(source_text ?? "").toLowerCase()` và match exact substring bằng `term_match_key`. `note` không tham gia matching.
5. Runtime scan source text từ trái sang phải; tại mỗi vị trí có match, chọn `term_match_key` dài nhất, tie chọn `group_key`, `concept_key`, rồi `concept_id` tăng dần; span đã chọn không được chồng lấn span khác.
6. POST/PATCH dùng full aggregate. `is_canonical` là field bắt buộc boolean trên mọi term; không tự đoán canonical từ thứ tự row.
7. Term cũ hiện có một row mỗi language được migrate với `is_canonical = 1` và giữ nguyên ID/text/timestamp.
8. Một `term_match_key` chỉ thuộc một concept trong cùng `(project, language_code)`. Migration/API/storage chặn collision xuyên concept, kể cả canonical hay variant, để không gửi mapping mâu thuẫn vào AI.
9. Từ các span không chồng lấn, runtime giữ một entry cho mỗi `(concept, target_language)`: chọn source match dài nhất; tie chọn vị trí xuất hiện nhỏ nhất, rồi `term_match_key` tăng dần. Runtime sort entries theo source-match length giảm dần, vị trí xuất hiện tăng dần, `group_key`, `concept_key`, `concept_id` tăng dần; giới hạn 40 áp dụng sau sort này.
10. Prompt translation coi glossary match là rule bắt buộc: dùng chính xác `target` canonical, không dùng synonym hoặc target variant. `buildStandardTranslationInput` tạo instruction này; mọi transport, gồm `codex_exec`, phải truyền nguyên văn instruction vào prompt thực tế. Human review vẫn có quyền chỉnh draft.
11. `project_id` của glossary concept là immutable sau create. Không dual-write, fallback hoặc giữ unique constraint cũ sau cutover.

## Target data model

```text
translation_glossary_concepts
- giữ nguyên

translation_glossary_terms
- id INTEGER PRIMARY KEY AUTOINCREMENT
- glossary_concept_id INTEGER NOT NULL REFERENCES translation_glossary_concepts(id) ON DELETE CASCADE
- language_code TEXT NOT NULL
- term TEXT NOT NULL
- term_match_key TEXT GENERATED ALWAYS AS (normalize_text_key(term)) STORED
- CHECK(length(term_match_key) > 0)
- is_canonical INTEGER NOT NULL CHECK (is_canonical IN (0, 1))
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL
- UNIQUE(glossary_concept_id, language_code, term_match_key)

unique partial index
- UNIQUE(glossary_concept_id, language_code) WHERE is_canonical = 1

SQLite triggers
- `BEFORE INSERT` reject cùng `(project_id, language_code, term_match_key)` thuộc một concept khác với marker `TRANSLATION_GLOSSARY_TERM_CONFLICT`
- `BEFORE UPDATE OF glossary_concept_id, language_code, term` reject collision tương tự với cùng marker
- `BEFORE UPDATE OF project_id` trên concept reject với marker `TRANSLATION_GLOSSARY_PROJECT_IMMUTABLE`
```

`src/infrastructure/database/connection.js` đăng ký scalar function deterministic `normalize_text_key` trước khi migration hoặc repository mở connection. Đây là primitive kỹ thuật generic, không import domain hoặc quyết định glossary policy; Translation quyết định dùng nó cho `term_match_key`. Function dùng đúng JavaScript normalization của runtime, nên không dựa vào SQLite `lower()` khác hành vi Unicode. `term_match_key` là internal column, không nhận từ API và không trả trong response.

Không thêm bảng alias riêng: term rows đã là representation đủ nhỏ cho canonical và variants. Hai trigger cross-concept là DB guardrail cần thiết vì `project_id` nằm ở concept; không denormalize `project_id` vào term. Trigger concept làm `project_id` immutable. Partial unique index chỉ bảo đảm tối đa một canonical; validation full aggregate của Translation owner cùng transaction PATCH bảo đảm mỗi language có ít nhất một canonical.

## API contract

Payload POST/PATCH thay toàn bộ term aggregate:

```json
{
  "group_key": "default",
  "concept_key": "facility_all",
  "note": "Dùng cho phạm vi toàn hệ thống.",
  "terms": [
    { "language_code": "ja", "term": "全施設", "is_canonical": true },
    { "language_code": "ja", "term": "全ての施設", "is_canonical": false },
    { "language_code": "ja", "term": "すべての館", "is_canonical": false },
    { "language_code": "vi", "term": "toàn bộ cơ sở", "is_canonical": true }
  ]
}
```

Validation tự tạo `term_match_key`, rồi trả `422 VALIDATION_ERROR` cho: thiếu `is_canonical`, giá trị không phải boolean, term rỗng, duplicate `(language_code, term_match_key)` trong payload, mỗi language không có canonical hoặc có nhiều canonical. Trigger marker `TRANSLATION_GLOSSARY_TERM_CONFLICT` trả `409 TRANSLATION_GLOSSARY_CONFLICT` với `details.field = "terms"`. Unique `(project_id, group_key, concept_key)` giữ lỗi concept-key riêng với `details.field = "concept_key"`; không map mọi `SQLITE_CONSTRAINT_UNIQUE` thành cùng một lỗi.

GET response giữ `terms` flat, mỗi term có `is_canonical`; sort theo `language_code`, canonical trước, rồi `term`. Response không lộ `term_match_key`.

## Runtime contract

Repository query mỗi source term row cùng target term row có `is_canonical = 1` trong cùng concept. Internal query giữ `concept_id`, `term_match_key` và match position để chọn span/dedupe/sort; context gửi AI vẫn giữ shape:

```js
{
  source: "全ての施設",
  target: "toàn bộ cơ sở",
  notes: "Dùng cho phạm vi toàn hệ thống.",
  group_key: "default",
  concept_key: "facility_all"
}
```

`prepareGlossaryForContext` chỉ giữ span source đã match; không còn fallback đưa source variant không khớp. Nó áp dụng scan span không chồng lấn, dedupe và sort ở quyết định 5/9 trước cap 40. Prompt instruction phải nêu rõ: khi entry khớp, dùng chính xác `target` canonical. `TranslationAdapter` render `request.instructions` thành mandatory instruction block trước context JSON. Process transport truyền request JSON nguyên vẹn; bundled `codexCliAdapter` bỏ instruction glossary chung và render `request.instructions` nguyên văn. Draft đã tạo không tự thay đổi; pending job đọc variants/canonical mới nhất khi execution.

## Admin UI contract

Modal concept nhóm term theo language. Mỗi language section có đúng một radio canonical. Chọn radio của variant promote term đó thành canonical và atomically demote canonical cũ trong local aggregate. Thêm language tạo một term canonical. Xóa canonical chỉ hợp lệ khi operator promote term khác trước hoặc xóa toàn bộ language section.

Table list vẫn compact: `Languages` hiển thị số term, ví dụ `ja (3), vi (1)`. View modal hiển thị canonical trước rồi variants. Translation Queue không thay đổi.

## Migration/cutover

SQLite không drop được table-level unique constraint bằng `ALTER TABLE`, vì vậy migration 016 rebuild `translation_glossary_terms` trong transaction:

1. TGV-00 verify-only mở database target read-only từ đường dẫn tuyệt đối được truyền rõ bằng direct SQLite connection; không gọi `createConnection`, `ensureStorage`, `migrate` hoặc WAL pragma. Script kiểm tra migration ledger, SQLite version có generated-column support và baseline một term mỗi language.
2. Function generic `normalize_text_key` phải có trên standard connection trước khi migration 016 chạy.
3. Tạo bảng thay thế giữ `AUTOINCREMENT`, thêm generated non-empty `term_match_key`, `is_canonical` và unique mới.
4. Assert không có collision `(project, language, term_match_key)` xuyên concept; collision là no-go, không tự merge concept.
5. Copy toàn bộ rows, giữ `id`, foreign key, text và timestamps, gán `is_canonical = 1`.
6. Verify count, mỗi language group đúng một canonical, generated key đúng JavaScript normalization và không mất relation tới concept.
7. Drop table cũ, rename bảng mới, tạo partial unique index, trigger term insert/update và trigger project immutable.

Không backup/rollback riêng. Transaction migration là atomic; failure không được để partial schema/data.

## Baseline files

| Khu vực | Hiện trạng |
| --- | --- |
| `src/db/migrations/015_translation_glossary_tables.sql` | Tạo unique cũ một term/language; không sửa file đã apply. |
| `src/infrastructure/database/connection.js` | Chưa đăng ký primitive deterministic generic cho generated match key. |
| `src/modules/Translation/support/validateTranslationGlossaryInput.js` | Chặn duplicate language thay vì duplicate term/language. |
| `src/modules/Translation/infrastructure/TranslationGlossaryRepository.js` | Read/write/query giả định một source và một target term. |
| `src/modules/Translation/application/collectTranslationContext.js` | Đã lọc entry match source text, giới hạn 40. |
| `src/modules/Translation/application/buildStandardTranslationInput.js` | Chỉ yêu cầu prefer glossary, chưa bắt buộc dùng canonical target. |
| `src/modules/Translation/infrastructure/TranslationAdapter.js` | Chưa render request instruction thành mandatory block trong chat prompt. |
| `src/infrastructure/ai/codexCliAdapter.js` | Có prompt riêng và chưa render `request.instructions` thành hard instruction. |
| `public/admin/app.js` | Modal có một input term/language. |
| `scripts/verify/translation-glossary-migration.js` | Chưa chạy fixture upgrade 015 -> 016 riêng biệt. |

## Risks và stop triggers

- Nếu migration không giữ term ID, timestamps, counts hoặc foreign-key integrity: dừng TGV-01.
- Nếu API/runtime chọn target variant thay vì canonical: dừng TGV-01.
- Nếu một `term_match_key` cùng Project/language map tới hai concept: dừng TGV-00 hoặc TGV-01; không gửi conflict vào AI.
- Nếu target SQLite không hỗ trợ generated column hoặc primitive deterministic không tạo được generated key: dừng TGV-00; không chạy migration 016.
- Nếu migration verifier không chứng minh được upgrade 015 -> 016 preserve và collision rollback: dừng TGV-01.
- Nếu runtime không chọn span không chồng lấn, không dedupe/sort xác định hoặc cap 40 sai vị trí: dừng TGV-01.
- Nếu chat prompt, process stdin hoặc bundled `codex_exec` prompt chỉ coi canonical target là preference: dừng TGV-01.
- Nếu UI cho save language không có đúng một canonical: dừng TGV-02.
- Nếu source matching trở thành fuzzy/regex hoặc scan `note`: ngoài scope, quay lại planner.
- Nếu requirement chuyển sang quản lý nhiều translation direction cho Project: plan riêng ở Projects, không ghép vào concept variants.
