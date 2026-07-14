# Plan — Translation Glossary Term Variants

> Ngày lập: 2026-07-14  
> Trạng thái: Automated implementation complete; manual acceptance pending  
> Scope: nhiều cách diễn đạt nguồn, một term canonical cho mỗi language của concept

## Mục tiêu

Cho phép một concept có nhiều term trong cùng một language để nhận diện text nguồn, đồng thời giữ đúng một term canonical cho mỗi language để AI nhận bản dịch đích nhất quán.

## Phạm vi

Bao gồm table rebuild/migration, API aggregate, runtime matching, Admin UI, regression verification và docs cho term variant/canonical.

Không bao gồm cấu hình `target_translate_languages` riêng trên concept. Translation direction vẫn thuộc Project/queue; glossary chỉ giữ term theo `language_code`.

## Baseline hiện tại

- `translation_glossary_terms` đang có `UNIQUE(glossary_concept_id, language_code)` nên mỗi language chỉ lưu được một term.
- Runtime join một source term với một target term rồi chỉ đưa term xuất hiện trong `source_text` vào context, tối đa 40 entry.
- UI chỉ có một input term cho mỗi language.

Chi tiết baseline và target contract: [Overview](00-overview.md).

## Source of truth

1. `AGENTS.md` — luật bắt buộc về scope Lite, module boundary, migration, test và tài liệu.
2. `docs/app/02-product/README.md` và `docs/app/10-decisions/README.md` — product scope và quyết định còn hiệu lực.
3. `docs/app/05-architecture/**` — ownership Translation, public boundary và AI boundary.
4. [Overview](00-overview.md) — contract implementation đã khóa cho plan này, không được mâu thuẫn ba nguồn trên.
5. [Input glossary hiện có](../../review/translate-glossary/input.md) — design provenance cần được TGV-00 đồng bộ sau khi preflight pass; không ghi đè contract ở overview.
6. Code, schema và verifier hiện tại — evidence kỹ thuật để xác nhận baseline.

Thứ tự xử lý khi các nguồn mâu thuẫn nằm tại [Overview](00-overview.md#source-precedence-và-architecture-decision).

## Phase triển khai

| Thứ tự | Phase | Phụ thuộc | Kết quả bắt buộc |
| --- | --- | --- | --- |
| 1 | [TGV-00 — Contract và preflight](01-phases/TGV-00-contract-and-preflight.md) | Không | Khóa canonical/variant contract, inventory data và migration strategy. |
| 2 | [TGV-01 — Atomic schema, API và runtime](01-phases/TGV-01-atomic-schema-api-runtime.md) | TGV-00 automated gate pass | Rebuild terms table, CRUD aggregate và source-variant to target-canonical runtime. |
| 3 | [TGV-02 — Admin UI, docs và handoff](01-phases/TGV-02-admin-ui-docs-handoff.md) | TGV-01 automated gate pass | UI variants, docs canonical và toàn bộ verification. |

## Điều phối

Snapshot current phase, blocked state, accepted gaps và resume rules chỉ có một source tại [02-coordination.md](02-coordination.md).

## Checklist nghiệm thu tổng

- [x] Một concept/language có nhiều term; đúng một term canonical.
- [x] Không thêm `target_translate_languages` vào concept và không tạo source of truth thứ hai cho translation direction.
- [x] Migration giữ nguyên concepts, term IDs, actor/timestamps và chuyển toàn bộ term cũ thành canonical.
- [x] API chặn term rỗng, duplicate theo `term_match_key`, thiếu canonical và nhiều canonical trong cùng language.
- [x] API/storage chặn cùng `(project, language_code, term_match_key)` thuộc hai concept khác nhau để không tạo mapping AI mâu thuẫn.
- [x] Runtime quét source variants theo exact match, chọn span không chồng lấn và thứ tự xác định, rồi áp giới hạn 40; context luôn dùng target canonical.
- [x] Mọi transport AI nhận hard instruction dùng chính xác target canonical khi source khớp glossary; source không khớp không được đưa vào context.
- [x] UI hiển thị canonical và variants rõ, hỗ trợ add/remove term, promote variant thành canonical theo language và không hard-code ngôn ngữ.
- [x] Translation Queue, glossary CRUD và full regression pass.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Điều kiện hoàn thành

TGV-00 có evidence preflight chỉ-đọc trên database target. TGV-01 và TGV-02 có evidence automated pass, `npm test` pass và người review xác nhận manual flow: nhập nhiều source variants, promote canonical, dịch đúng target canonical và quản lý UI thành công.
