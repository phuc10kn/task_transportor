# Overview — Project Translation Glossary

## Mục tiêu nghiệp vụ

Operator quản lý glossary theo Project bằng concept ổn định, mỗi concept có nhiều term theo `language_code`. Translation worker lấy đúng cặp term nguồn/đích khi tạo AI draft.

Quyết định trung tâm: thay hoàn toàn `projects.translation_glossary_json` bằng hai bảng normalized và một màn Translation Glossary mới; không giữ source/UI cũ chạy song song.

## In scope

- Hai bảng `translation_glossary_concepts` và `translation_glossary_terms`.
- `group_key` mặc định `default`, `concept_key`, `note` và danh sách term động.
- CRUD aggregate qua endpoint project-scoped thuộc Translation module.
- Màn Admin UI **Translation Glossary** gồm compact table và modal dùng pattern hiện có của Admin UI.
- Atomic backend cutover: backfill, xóa JSON, Project cleanup và runtime switch trong một phase.
- Verification, tài liệu canonical và ownership architecture.

## Out of scope

- Glossary global/shared, import/export và bulk edit.
- Version history, restore, soft delete và audit history riêng.
- Enable/disable concept hoặc chọn group áp dụng theo job.
- Tự động retranslate khi glossary thay đổi.
- Split-pane, data grid, fuzzy matching, morphology hoặc AI tự học term.

## Quyết định đã khóa

1. Translation sở hữu glossary; Projects chỉ cung cấp Project identity và language config.
2. Chỉ dùng hai bảng normalized; không thêm cột cố định theo ngôn ngữ.
3. `UNIQUE(project_id, group_key, concept_key)` và `UNIQUE(glossary_concept_id, language_code)` là DB guardrail.
4. Mọi group đều được runtime sử dụng; group chỉ phục vụ tổ chức/lọc.
5. Add/Edit ghi toàn bộ concept aggregate trong transaction; POST và PATCH dùng cùng full payload, PATCH thay thế đầy đủ mảng `terms`.
6. Translation Glossary là UI mutation duy nhất; Translation Queue vẫn là màn review riêng.
7. Project Config không nhận, lưu hoặc hiển thị glossary sau cutover.
8. Backend migration/API/Projects cleanup/runtime switch nằm trong TGL-01 và không được release từng phần.
9. Request Project create/update còn gửi `translation_glossary_json` bị từ chối rõ.
10. Draft đã tạo không tự đổi; pending job dùng glossary mới nhất tại execution time.

## Quy ước chuẩn hóa và lỗi

Mọi scalar text đi qua `String(value ?? "").trim()` trước khi validate/lưu. Identifier text dùng thêm `.toLowerCase()`:

- `group_key`: normal text lowercase; rỗng thành `default`.
- `concept_key`: normal text lowercase, không rỗng.
- `language_code`, Project `source_language`/`target_language` và language trên queue item: normal text lowercase, không ép regex BCP 47. Migration chuẩn hóa cả giá trị Project đã lưu; Project create/update tiếp tục chuẩn hóa trước khi ghi.
- `term`: normal text, giữ nguyên case và nội dung bên trong, không rỗng.
- `note`: normal text optional, giữ nguyên case; rỗng lưu `NULL`.
- Duplicate language trong payload: `422 VALIDATION_ERROR`, `details.field = "terms.language_code"`.
- Unique conflict từ storage/race: `409 TRANSLATION_GLOSSARY_CONFLICT`.
- Project không tồn tại: `404 PROJECT_NOT_FOUND`, giữ contract từ `ProjectsApi.getProject`.
- Concept không tồn tại hoặc không thuộc Project trong URL: `404 TRANSLATION_GLOSSARY_NOT_FOUND`.
- `projectId`/`conceptId` không phải integer dương: `422 VALIDATION_ERROR` với `details.field` tương ứng.

## Baseline code

| Khu vực | Hiện trạng cần thay đổi |
| --- | --- |
| `src/db/migrations/003_translation_glossary.sql` | Đã thêm `projects.translation_glossary_json`; không sửa migration cũ. |
| `src/modules/Projects/support/validateProjectInput.js` | Đang accept/normalize JSON cũ. |
| `src/modules/Projects/support/defaultProjectConfig.js` | Đang cấp default `[]`. |
| `src/modules/Projects/infrastructure/ProjectRepository.js` | Đang serialize/project JSON cũ. |
| `src/modules/Translation/infrastructure/TranslationContextRepository.js` | Đang lấy JSON từ Project. |
| `src/modules/Translation/application/collectTranslationContext.js` | Đang chọn cặp `source`/`target`, chưa lọc source-term trước context, tối đa 20 entry. |
| `public/admin/app.js` | Chưa có màn glossary riêng. |
| `scripts/verify/projects.js`, `scripts/verify/translation-review.js` | Còn seed/assert JSON cũ. |

Migration hiện hành mới nhất là `014_project_credentials_in_db.sql`; migration plan này được khóa là `015_translation_glossary_tables.sql`.

## Source of truth

| Ưu tiên | Nguồn | Vai trò |
| --- | --- | --- |
| 1 | `AGENTS.md` | Scope Lite, module/docs/test rules. |
| 2 | `docs/app/02-product/README.md` | Product scope/hành vi Lite. |
| 3 | `docs/app/10-decisions/README.md` | Quyết định còn hiệu lực. |
| 4 | `docs/app/05-architecture/**` | Ownership, structure, boundary và interactions. |
| 5 | `docs/review/translate-glossary/input.md` | Glossary design đã được user chốt. |
| 6 | Code/migration/verify hiện tại | Baseline và regression evidence. |

Source architecture trực tiếp:

- `docs/app/05-architecture/01-structure/modules/MOD-003-translation/README.md`
- `docs/app/05-architecture/01-structure/modules/MOD-008-projects/README.md`
- `docs/app/05-architecture/04-state/state-owners/SO-002-translation-review-state/README.md`
- `docs/app/10-decisions/01-decision-making/01-decisions/DEC-002-app-graph-materialization-policy/README.md`

## Preflight dữ liệu

Trước TGL-01 phải inventory mọi Project có JSON khác `[]`: parseability, shape, empty values, source/target languages, same-language collision và count concept/term dự kiến. Dữ liệu không map an toàn làm TGL-00 `no-go`; không silent skip và không giữ JSON fallback.

## Data model

```text
translation_glossary_concepts
- id INTEGER PRIMARY KEY AUTOINCREMENT
- project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE
- group_key TEXT NOT NULL DEFAULT 'default'
- concept_key TEXT NOT NULL
- note TEXT NULL
- created_by INTEGER NULL REFERENCES admin_users(id) ON DELETE SET NULL
- updated_by INTEGER NULL REFERENCES admin_users(id) ON DELETE SET NULL
- created_at TEXT NOT NULL DEFAULT (datetime('now'))
- updated_at TEXT NOT NULL DEFAULT (datetime('now'))
- UNIQUE(project_id, group_key, concept_key)
```

```text
translation_glossary_terms
- id INTEGER PRIMARY KEY AUTOINCREMENT
- glossary_concept_id INTEGER NOT NULL REFERENCES translation_glossary_concepts(id) ON DELETE CASCADE
- language_code TEXT NOT NULL
- term TEXT NOT NULL
- created_at TEXT NOT NULL DEFAULT (datetime('now'))
- updated_at TEXT NOT NULL DEFAULT (datetime('now'))
- UNIQUE(glossary_concept_id, language_code)
```

Không tạo bảng group riêng và không tạo secondary index trùng cột. Hai unique constraint sinh đủ index cho lookup Lite: prefix `(project_id, group_key)` của concept và `(glossary_concept_id, language_code)` của term.

## Migration và cutover

`015_translation_glossary_tables.sql` thực hiện trong transaction của migration runner:

1. Tạo bảng/index.
2. Chuẩn hóa toàn bộ `projects.source_language` và `projects.target_language` hiện hữu bằng `String(...).trim().toLowerCase()` tương đương trong SQLite; giá trị rỗng sau chuẩn hóa làm migration fail.
3. Map JSON entry thành concept `default`, key `legacy-<project-id>-<position>`.
4. Map `notes` sang `note`; source/target sang term bằng Project language đã chuẩn hóa.
5. Assert count và ambiguity.
6. Xóa cột `projects.translation_glossary_json` bằng chiến lược đã khóa ở TGL-00.

Backfill để audit actor `NULL`. API create dùng `req.user.id` cho `created_by`/`updated_by`; update giữ creator, cập nhật `updated_by` và `updated_at`. Terms của PATCH được thay thế trong cùng transaction.

## API và boundary

```text
GET    /api/v1/projects/:projectId/translation-glossary?group_key=&q=
POST   /api/v1/projects/:projectId/translation-glossary/concepts
PATCH  /api/v1/projects/:projectId/translation-glossary/concepts/:conceptId
DELETE /api/v1/projects/:projectId/translation-glossary/concepts/:conceptId
```

Translation kiểm tra Project qua `ProjectsApi.getProject`. GET trả `{project_id, concepts}` với terms sort theo language; concepts sort group/key. Mỗi concept aggregate trả đúng `{id, project_id, group_key, concept_key, note, created_by, updated_by, created_at, updated_at, terms}`, mỗi term trả `{id, language_code, term, created_at, updated_at}`. `q` tìm group, key, note hoặc term nhưng luôn scope Project. Không response nào chứa Project credential/config đầy đủ.

Contract request/response được khóa như sau:

- Tất cả response thành công dùng envelope `{data: ...}` hiện có.
- GET trả `200` với `data = {project_id, concepts}`.
- POST trả `201` với `data = <concept aggregate vừa tạo>`.
- PATCH trả `200` với `data = <concept aggregate sau cập nhật>`.
- DELETE trả `200` với `data = {id, deleted: true}`; không dùng `204`.
- POST và PATCH cùng nhận full aggregate: `concept_key` và `terms` bắt buộc; `group_key` optional/rỗng thì thành `default`; `note` optional/rỗng thì thành `NULL`.
- `terms` phải là array có ít nhất một phần tử. Mỗi phần tử bắt buộc có `language_code` và `term` không rỗng; một term cho phép concept được khai báo dần, runtime vẫn chỉ materialize concept đủ cặp nguồn/đích.
- PATCH thay toàn bộ `terms`; không merge term bị thiếu khỏi payload.

## Runtime context

Runtime query concept theo Project và materialize khi đủ source/target term:

```js
{
  source: "予約",
  target: "đặt chỗ",
  notes: "Dùng cho thao tác đặt phòng.",
  group_key: "hotel",
  concept_key: "reservation"
}
```

Runtime normalize language từ queue item và Project bằng cùng rule normal text lowercase trước khi query. Preprocessing quét `source_text`, chỉ giữ glossary term có `source` xuất hiện trong text, rồi giới hạn danh sách khớp ở 40 entry trước khi đưa vào context. Không JSON fallback. Pending job đọc tại execution time; draft đã tạo không tự đổi.

## Admin UI

Thêm nav **Translation Glossary**, giữ **Translations** cho queue review. Layout dùng compact table Group/Concept key/Languages/Note/Actions và modal cho Add/Edit/View term động, tái sử dụng `modal-backdrop`/`modal-panel` hiện có. Không preload glossary lúc boot, không hard-code language columns và không thêm data-grid dependency.

## Architecture materialization

Tạo `SO-007-translation-glossary-state` và thêm `MOD-003 --owns--> SO-007`. Không thêm `SO-007 --shared_via--> DF-002`: DF-002 chuyển CIS context vào Translation, không phải data flow chia sẻ glossary.

Trace need theo DEC-002 được khóa như sau:

- Người cần trace: người review architecture và release.
- Start entity: `MOD-003`.
- Query cần trả lời: Translation module sở hữu state nào dùng cho glossary CRUD và translation context.
- Mục đích: xác nhận Projects không còn sở hữu/ghi glossary và không materialize nhầm glossary qua `DF-002`.
- Evidence fact: `TranslationGlossaryRepository`, Translation glossary API/routes và runtime context query thuộc Translation module.
- Contract: relation `owns`, valid triple `Module --owns--> StateOwner`, slot `owns` trên `MOD-003`.
- Query nghiệm thu: `npm run architecture:trace -- --from MOD-003`; kết quả phải chứa `MOD-003 --owns--> SO-007`.

Slice này tăng clean baseline từ 42 lên 43 architecture instances và từ 127 lên 128 canonical edges. State index, architecture summary, clean-baseline record và verifier phải được cập nhật đồng bộ trong TGL-03.
