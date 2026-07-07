# Entity Instance Template

Template cho `README.md` — canonical entry point của Entity Instance.

Path:

```text
docs/app/<NN-layer>/<concern>/<entity-type-plural>/<ID-slug>/README.md
```

---

## Template

```markdown
---
id: MOD-004
slug: spec-graph
entity_type: Module
layer: 05-architecture
concern: structure
status: draft
theory_basis:
  - TH-MOD-03
decision_basis:
  - DEC-021
---

# MOD-004 — Spec Graph

## Meaning

[Một đoạn: entity này là gì trong context app]

## Responsibility

[Boundary và trách nhiệm]

## Key properties

| Property | Value |
|----------|-------|
| [name] | [value] |

## Rules / constraints

- [derived rule từ theory — không copy full theory]
- [project-specific rule]

## Behavior (nếu áp dụng)

[Mô tả behavior có giá trị — không document mọi method]

## State / lifecycle (nếu áp dụng)

[State evolution có domain hoặc architecture meaning]

## Related Entities

- `MOD-001-orders` — [mô tả liên hệ]

## Open Relation Question

> Chỉ dùng khi Relation Type chưa canonical trong Meta.
> **NOTE-CANDIDATE**: Relation X→Y chưa có type trong docs/meta/02-relation-types/

## Open questions

> **NOTE-OPEN**: [thông tin chưa có]

## Evidence (nếu cần)

> **NOTE-EVIDENCE**: [link incident, metric, ...]

## History

Không tạo revision system riêng — Git là history.
Ghi Decision reference nếu có thay đổi quan trọng qua `decision_basis`.
```

---

## Frontmatter fields

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `id` | yes | Stable ID (MOD-004, PROB-001, FE-012) |
| `slug` | yes | URL/folder slug |
| `entity_type` | yes | Canonical name từ Meta |
| `layer` | yes | Layer number + name |
| `concern` | yes | Concern folder |
| `status` | recommended | draft / active / deprecated |
| `theory_basis` | khi có | List TH-* IDs |
| `decision_basis` | khi có | List DEC-* IDs |

Thêm fields chỉ khi Entity Type definition trong Meta yêu cầu.

---

## ID pattern (gợi ý)

| Entity Type | Prefix | Ví dụ folder |
|-------------|--------|--------------|
| Problem | PROB | `PROB-001-manual-reconciliation/` |
| Process | PROC | `PROC-003-order-fulfillment/` |
| Feature | FE | `FE-012-bulk-import/` |
| Module | MOD | `MOD-004-spec-graph/` |
| Risk | RISK | `RISK-002-shared-state/` |
| Incident | INC | `INC-003-api-timeout/` |
| Decision | DEC | `DEC-021-module-boundary/` |

Xác nhận pattern chính thức tại `docs/meta/04-conventions/` trước khi tạo.

---

## Supporting docs

Chỉ thêm khi cần:

```text
views/
examples/
assets/
notes/
```

`README.md` vẫn là entry point — agent đọc README trước.

---

## Sau khi tạo

1. Chạy `meta-validate` trên path mới
2. Nếu có `theory_basis` — cân nhắc `theory-review`
3. Commit qua Git — không revision system riêng
