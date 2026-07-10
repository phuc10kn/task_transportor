# Entity Instance Template Helper

Canonical schema:

```text
docs/meta/00-schemas/entity-instance.md
```

Canonical unit guide:

```text
docs/guide/unit-structure/entity/README.md
```

File này chỉ là helper cho agent, không thay schema/meta.

> EXAMPLE ONLY: toàn bộ ID, slug, title, relation target và decision bên dưới là ví dụ structure. Không copy các giá trị này thành canonical entity nếu chưa xác nhận chúng tồn tại trong `docs/app` hoặc `docs/meta`.

## Path

```text
docs/app/<NN-layer>/<NN-concern>/<NN-entity-type-folder>/<ID-slug>/README.md
```

## Frontmatter

```yaml
---
schema: entity-instance/v1
id: EXAMPLE-001
slug: example-boundary
title: Example Boundary
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
summary: Một câu mô tả meaning của entity ví dụ.
theory_basis:
  - TH-EXAMPLE
decision_basis:
  - DEC-EXAMPLE
relations:
  constrains:
    - EXAMPLE-RELATED-001
---
```

## Body

```md
# EXAMPLE-001 - Example Entity

## Summary

## Meaning

## Relations

## Validation Notes
```

Nếu entity type có `structure extends`, thêm section required từ entity type definition.

Relation trong ví dụ chỉ hợp lệ nếu `constrains` đã tồn tại trong `relations_template` của entity type và slot đó resolve được tới relation type + valid triple.

Không ghi relation nghi ngờ trong entity instance. Relation thiếu slot hoặc thiếu meta rule bị reject khỏi draft.

## Sau Khi Draft

1. Chạy `meta-validate`.
2. Kiểm tra `docs/guide/workflows/trace-impact.md` nếu có relation.
3. Nếu có `theory_basis`, xác nhận theory ID thật rồi cân nhắc `theory-review`.
