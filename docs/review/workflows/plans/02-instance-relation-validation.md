# Plan 02 — Generic Instance / Relation Validation

Finding liên quan: WFP-03, WFP-07, WFP-08  
Trạng thái: **đã triển khai phương án C** (scoped gate `05-architecture`); WFP-08 (body-link `docs/app`) vẫn mở

## Vấn đề gốc

Tooling hiện tại tạo cảm giác an toàn lớn hơn coverage thật:

- `--instance` chỉ resolve instance path tới entity type và kiểm tra type có `schema` + `## structure extends`;
- `verify:docs` không quét `docs/app` / `docs/meta`;
- relation validation generic vẫn thủ công;
- architecture có frozen baseline riêng, Business/Product/Domain không có verifier tương đương.

Hệ quả: instance thiếu required section hoặc relation sai vẫn có thể “xanh”.

## Phương án

| PA | Mô tả | Ưu điểm | Nhược điểm | Ảnh hưởng sửa | Sửa được gốc? | Recommend |
| --- | --- | --- | --- | --- | --- | --- |
| A | Giữ checklist thủ công trong `validate-after-change` | Không viết code; semantic review linh hoạt; dùng ngay | Dễ bỏ bước; không CI enforce; kết quả không ổn định giữa reviewer | Thấp | Không | 2/5 — giải pháp tạm |
| B | Mở rộng `entity-type-contract.js` để validate luôn instance/relation | Tận dụng command hiện có; ít entry point mới | Tên/script ôm quá nhiều trách nhiệm; khó bảo trì; lỗi type và lỗi instance lẫn nhau | Trung–Cao: sửa script hiện có và test | Một phần | 3/5 — không ưu tiên |
| C | Tạo verifier riêng: `verify:entity-instance`, `verify:relations`, `verify:references` | Phân trách nhiệm rõ; generic mọi layer; report chính xác; CI compose được | Cần parser meta/frontmatter ổn định; effort/test cao; semantic meaning vẫn cần human | Cao: script mới, package scripts, tests, CI | **Có cho structural gap** | **5/5 — đã triển khai** |
| D | Generalize `architecture-clean-baseline.js` cho mọi layer | Có code precedent cho edge/target/type | Baseline chứa assumptions/frozen count riêng architecture; dễ mang coupling sai sang Business | Cao và rủi ro | Không; tạo debt mới | 1/5 — không khuyến nghị |

## Đề xuất

Đã chọn **C**. Ba gate độc lập:

```text
verify:entity-instance
  path → frontmatter → ID/status → required body sections → type resolution

verify:relations
  slot → relation type → valid triple → direction → target exists/type

verify:references
  theory_basis / decision_basis → target exists
```

Shared lib: `scripts/verify/lib/docs-contract/`.

Pilot hiện tại: `--layer 05-architecture` (42 instance) gắn vào `npm test`. Frozen architecture baseline vẫn riêng. Business/Product dùng cùng command khi có instance.

Checklist human vẫn giữ cho:

- meaning có đúng Entity Type không;
- boundary business/product/domain có đúng không;
- evidence có đủ để coi là app truth không;
- relation có trace need hay chỉ để làm đẹp graph.

## Thứ tự triển khai

1. Tách parser frontmatter/path/type-resolution dùng chung. — đã làm
2. Viết `verify:entity-instance` trước, không relation. — đã làm
3. Viết fixture pass/fail cho Business và Architecture. — đã làm (`docs-contract.test.js`)
4. Thêm `verify:relations`. — đã làm
5. Thêm `verify:references`. — đã làm
6. Mở rộng `verify:docs` quét link trong app/meta hoặc giữ command link riêng. — **chưa** (WFP-08)
7. Gắn vào `npm test` sau khi baseline app hiện tại sạch. — đã làm scoped `05-architecture`

## Phạm vi đã sửa

- `scripts/verify/lib/docs-contract/**`
- `scripts/verify/entity-instance.js`
- `scripts/verify/relations.js`
- `scripts/verify/references.js`
- `scripts/verify/docs-contract.test.js`
- `package.json`
- `docs/guide/workflows/validate-after-change.md`, `write-docs.md`, `trace-impact.md`
- AGENT_SKILLS: `meta-validate`, `doc-create-entity`, `graph-materialize`

## Guardrail

Không được gọi structural verifier là “semantic validation”. Command pass chỉ chứng minh structure/reference/relation contract, không chứng minh business fact đúng.

## Acceptance

- [x] Process thiếu `Trigger` hoặc `Outcomes` fail (fixture).
- [x] Relation thiếu slot/triple/target fail (fixture).
- [x] Wrong direction / undeclared outbound fail; reverse lookup không đòi dual edge.
- [x] Theory/decision reference thiếu target fail theo scope command.
- [x] Business instance được kiểm tra generic qua fixture, không phụ thuộc frozen architecture count.
- [ ] Body-link navigation `docs/app` / `docs/meta` (WFP-08) — ngoài scope.
