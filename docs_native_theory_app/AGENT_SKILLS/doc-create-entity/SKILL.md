---
name: doc-create-entity
description: Creates new Entity Instance documentation in docs/app/ following Meta entity types, layer/concern placement, ID conventions, and README template. Use when adding problems, features, modules, screens, or other documented entities.
---

# doc-create-entity

Tạo entity instance mới trong `docs/app/` theo Meta và conventions.

## Input

```text
entity type (Problem, Module, Feature, Screen, ...)
tên / mô tả ngắn
optional: theory_basis, decision_basis IDs
```

## Workflow

```text
Task Progress:
- [ ] Xác nhận Entity Type canonical trong docs/meta/01-entity-types/
- [ ] Nếu chưa canonical → NOTE-CANDIDATE, không tự bịa schema
- [ ] Chọn Layer + Concern đúng (doc-navigate hoặc layer-routing)
- [ ] Xác nhận ID pattern từ Meta conventions
- [ ] Tạo folder: <entity-type-plural>/<ID-slug>/README.md
- [ ] Điền README theo template
- [ ] Ghi relations — không tự tạo Relation Type mới
- [ ] Chạy meta-validate trên draft
```

## Placement

```text
docs/app/<NN-layer>/<concern>/<entity-type-plural>/<ID-slug>/README.md
```

Ví dụ:

```text
docs/app/05-architecture/01-structure/modules/MOD-004-spec-graph/README.md
```

## Trước khi tạo

| Kiểm tra | Nguồn |
|----------|-------|
| Entity Type tồn tại? | `docs/meta/01-entity-types/` |
| ID prefix đúng? | `docs/meta/04-conventions/` |
| Layer/concern đúng? | [../reference/layer-routing.md](../reference/layer-routing.md) |
| Theory reference? | `theory_basis` — không copy full theory |

## Output

Tạo file theo [../reference/entity-instance-template.md](../reference/entity-instance-template.md).

Trả summary:

```markdown
## doc-create-entity result

### Created
- Path: docs/app/.../README.md
- ID: XXX-NNN-slug
- Entity Type: [type]
- Layer / Concern: [path]

### Open items
- NOTE-OPEN: [...]

### Validation
- [ ] meta-validate passed / issues listed

### Related skills
- theory-find nếu cần bổ sung theory_basis
```

## Relations

Trước khi Relation Type chốt trong Meta:

```markdown
## Related Entities
- [MOD-001-orders](../path) — [mô tả liên hệ]

## Open Relation Question
- Relation giữa X và Y chưa có canonical type — NOTE-CANDIDATE
```

Không tự đặt relation type name như canonical.

## Ràng buộc

```text
Agent output = draft entity — human reviews before commit
README.md = canonical entry point
Không tạo supporting docs (views/, examples/) trừ khi cần thiết
```

Thiếu thông tin → NOTE-OPEN, không assumption ẩn.

## Anti-patterns

```text
tạo entity type mới trong app/ mà không qua Meta
đặt Module trong 02-product/
copy full Theory vào entity README
bịa ID không theo convention
```

## Thêm

- Template: [../reference/entity-instance-template.md](../reference/entity-instance-template.md)
- Validate: [../meta-validate/SKILL.md](../meta-validate/SKILL.md)
- Note types: [../guides/note-types.md](../guides/note-types.md)
