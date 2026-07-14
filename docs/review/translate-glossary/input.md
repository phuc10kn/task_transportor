# Input review — Translation Glossary Term Variants

> Ngày: 2026-07-14  
> Trạng thái: Contract đã chốt; đang triển khai theo plan `translation-glossary-term-variants`.
> Phạm vi: glossary theo Project, hỗ trợ nhiều language và nhiều source variant cho một concept.

## 1. Bối cảnh hiện tại

Glossary normalized đã là source of truth của Translation thay cho `projects.translation_glossary_json`. Mỗi concept biểu diễn một ý nghĩa ổn định; một language có thể có nhiều term để nhận diện source, nhưng chỉ một term canonical để làm target translation.

Mục tiêu của thay đổi là xử lý trường hợp source có nhiều cách diễn đạt, trong khi target chỉ cần một cách dịch chuẩn. Thiết kế không thêm cột cố định theo ngôn ngữ và không thêm `target_translate_languages` vào concept.

## 2. Quyết định dữ liệu

Glossary được lưu bằng hai bảng, với Translation là owner nghiệp vụ:

```text
translation_glossary_concepts
- id
- project_id
- group_key        -- default: "default"
- concept_key
- note
- created_at
- updated_at
- created_by
- updated_by
```

```text
translation_glossary_terms
- id
- glossary_concept_id
- language_code
- term                  -- text hiển thị gốc
- term_match_key        -- generated, internal, trim + lower-case
- is_canonical          -- đúng một row true trong mỗi concept/language
- created_at
- updated_at
```

Ràng buộc:

```text
UNIQUE(project_id, group_key, concept_key)
UNIQUE(glossary_concept_id, language_code, term_match_key)
UNIQUE(glossary_concept_id, language_code) WHERE is_canonical = 1
cross-concept guard: project_id + language_code + term_match_key
```

`term_match_key` được tạo bởi primitive kỹ thuật deterministic `normalize_text_key`, không nhận từ API và không trả trong response. `group_key` là tên cột nội bộ; UI hiển thị là **Group**. Không dùng tên cột `group` vì đây là từ khóa SQL. Concept chưa chọn nhóm dùng `group_key = "default"`.

## 3. Ý nghĩa từng phần

| Thành phần | Ý nghĩa |
| --- | --- |
| `project_id` | Cô lập glossary theo Project; không có glossary global trong scope này. |
| `group_key` | Nhóm nghiệp vụ để điều hướng, ví dụ `default`, `hotel`, `support`. |
| `concept_key` | Định danh ổn định của một khái niệm, không phụ thuộc vào cách dịch. |
| `note` | Ngữ cảnh hoặc quy tắc dùng chung cho khái niệm; không tham gia matching. |
| `language_code` | Mã ngôn ngữ, ví dụ `ja`, `vi`, `en`. |
| `term` | Cách viết của khái niệm trong language đó. |
| `is_canonical` | Đánh dấu term duy nhất được dùng làm target của language đó. |
| source variant | Term canonical hoặc term variant được quét khi language là source. |

Ví dụ một concept ba ngôn ngữ:

```text
Project: DMP
Group: hotel
Concept key: reservation
Note: Dùng cho thao tác đặt phòng.

ja: 予約             (canonical hoặc source variant)
ja: 予約をする         (source variant)
vi: đặt chỗ            (canonical)
en: reservation       (canonical)
```

Khi worker dịch `ja -> vi`, mọi ja variant khớp đều map tới `vi` canonical. Khi dịch `ja -> en`, cùng concept được dùng lại với `en` canonical.

## 4. Ownership và API boundary

Glossary là translation context, vì vậy Translation module sở hữu repository, validation, CRUD và cách đưa term vào AI prompt. Projects chỉ sở hữu Project identity/config và cung cấp `project_id` làm scope.

API public project-scoped:

```text
GET    /api/v1/projects/:projectId/translation-glossary
POST   /api/v1/projects/:projectId/translation-glossary/concepts
PATCH  /api/v1/projects/:projectId/translation-glossary/concepts/:conceptId
DELETE /api/v1/projects/:projectId/translation-glossary/concepts/:conceptId
```

Payload concept dùng `group_key`, `concept_key`, `note` và mảng `terms`:

```json
{
  "group_key": "hotel",
  "concept_key": "reservation",
  "note": "Dùng cho thao tác đặt phòng.",
  "terms": [
    { "language_code": "ja", "term": "予約", "is_canonical": true },
    { "language_code": "ja", "term": "予約をする", "is_canonical": false },
    { "language_code": "vi", "term": "đặt chỗ", "is_canonical": true },
    { "language_code": "en", "term": "reservation", "is_canonical": true }
  ]
}
```

Validation từ chối term rỗng, duplicate normalized key trong cùng language, thiếu canonical hoặc nhiều canonical. Cross-concept normalized collision trả `409 TRANSLATION_GLOSSARY_CONFLICT`; concept-key conflict có field error riêng.

## 5. UI đã chốt

Chỉ giữ hai chức năng riêng:

1. **Translation Glossary**: quản lý đầy đủ `group_key`, `concept_key`, note và mọi language/term của Project.
2. **Translations / Translation Queue**: review AI draft; không trộn với quản lý glossary.

Layout mặc định là bảng gọn nhẹ; chọn một dòng mở drawer/modal chi tiết:

```text
Translation Glossary

Project: [DMP v]  Group: [All v]  [Search concept/term...]  [+ Add concept]

┌────────────┬──────────────┬──────────────┬──────────────────┬─────────┐
│ Group      │ Concept key  │ Languages    │ Note             │ Actions │
├────────────┼──────────────┼──────────────┼──────────────────┼─────────┤
│ hotel      │ reservation  │ ja (2), vi, en│ Dùng đặt phòng   │ Edit    │
└────────────┴──────────────┴──────────────┴──────────────────┴─────────┘
```

Drawer/modal hiển thị từng language section. Mỗi section có một radio canonical; chọn variant sẽ promote variant đó và demote canonical cũ trong cùng aggregate. Add/remove term giữ language dynamic. Không cho xóa canonical nếu chưa chọn canonical mới hoặc xóa toàn bộ language section.

Project Config không có editor hoặc payload glossary. Cột/trường không hard-code `source`/`target`; mọi mutation đi qua Translation Glossary API.

## 6. Tác động lên translation runtime

`collectTranslationContext` lấy term theo `project_id` và cặp source/target language tại execution time. Source query lấy canonical và variants; target query chỉ lấy `is_canonical = 1`.

Runtime scan source text theo exact substring sau normalization. Span overlap giữ match dài nhất; sau đó dedupe theo concept/target, sort deterministic và cắt tối đa 40 entry. Source không khớp và `note` không được đưa vào context.

```text
concept -> source variant match + target canonical -> glossary context cho AI
```

Prompt translation yêu cầu hard rule: khi glossary match, dùng đúng target canonical, không chọn synonym hoặc target variant. Chat adapter và bundled process adapter phải truyền instruction này; draft đã tạo không tự thay đổi, pending item đọc glossary mới tại execution time.

## 7. Migration và cutover

Migration 015 đã backfill glossary normalized và xóa `translation_glossary_json`. Preflight TGV-00 xác nhận database target đang ở baseline một term mỗi language, không có normalized cross-concept collision, không có blank term và chưa apply migration 016.

Migration 016 rebuild `translation_glossary_terms` trong transaction, giữ `AUTOINCREMENT`, ID, text và timestamps; thêm generated `term_match_key`, `is_canonical`, unique mới, partial unique canonical và trigger collision insert/update. `project_id` của concept immutable sau create.

Không backup/rollback riêng. Failure phải rollback atomic; không dual-write JSON và bảng normalized.

## 8. Đánh giá

| Tiêu chí | Đánh giá |
| --- | --- |
| Hỗ trợ đa ngôn ngữ | Tốt: thêm language là thêm row, không đổi schema. |
| Nhiều cách diễn đạt nguồn | Tốt: variants nhận diện source, canonical giữ target nhất quán. |
| Tính nhất quán | Tốt: một concept/language có đúng một canonical; collision xuyên concept bị chặn. |
| Hiệu năng Lite | Đủ: glossary theo Project thường nhỏ; runtime cap 40 sau dedupe. |
| UX | Tốt cho Lite: bảng gọn + drawer/modal, promote canonical rõ ràng. |
| An toàn boundary | Tốt: Translation sở hữu state/API/prompt; Project chỉ sở hữu direction. |
| Chi phí triển khai | Trung bình: migration, CRUD, runtime, UI và verifier; không thêm dependency. |

## 9. Rủi ro và guardrail

- Không thêm cột cố định như `ja_term`, `vi_term`, `en_term` hoặc `third_term`.
- Không thêm `target_translate_languages` vào concept; direction lấy từ Project/queue.
- Không dùng glossary global; mọi query luôn scope `project_id`.
- Không cho hai concept cùng Project/language dùng một `term_match_key`.
- Không cho save language khi thiếu hoặc có nhiều canonical.
- Không cập nhật ngược AI draft cũ khi glossary thay đổi; operator dùng Retranslate.
- Không để UI gọi Project endpoint làm lộ credential để lấy glossary.
- Không giữ compatibility editor trong Project Config; Translation Glossary là UI mutation duy nhất.
- Không dùng fuzzy matching, regex, morphology hoặc AI synonym matching trong scope này.

## 10. Acceptance đề xuất

- Tạo một concept với nhiều ja variants và một vi canonical thành công.
- Promote một variant thành canonical; canonical cũ trở thành variant sau khi mở lại concept.
- Tạo duplicate normalized term trong cùng language bị từ chối.
- Tạo cùng normalized term ở hai concept khác nhau trong cùng Project/language trả `409`.
- Worker dịch `ja -> vi` và `ja -> en` dùng đúng canonical target tương ứng.
- Source overlap giữ match dài nhất; context không vượt 40 sau dedupe/sort.
- Chat và process request đều có hard canonical instruction.
- UI chỉ hiển thị glossary của Project đã chọn và không trả credential.
- Project Config không còn editor/payload glossary.
- Migration/preflight giữ ID/text/timestamp, không mất dữ liệu và không tạo dual source of truth.
