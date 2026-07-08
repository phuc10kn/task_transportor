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

## Path

```text
docs/app/<NN-layer>/<NN-concern>/<NN-entity-type-folder>/<ID-slug>/README.md
```

## Frontmatter

```yaml
---
schema: entity-instance/v1
id: PROC-001
slug: backlog-to-cis-lite
title: Backlog To CIS Lite Flow
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Business flow Lite từ Backlog vào CIS.
theory_basis:
  - TH-HUBFLOW
decision_basis:
  - DEC-001
relations:
  - type: governed_by
    target: BRULE-001
---
```

## Body

```md
# PROC-001 - Backlog To CIS Lite Flow

## Summary

## Meaning

## Relations

## Validation Notes
```

Nếu entity type có `structure extends`, thêm section required từ entity type definition.

## Open Relation Question

```md
> **NOTE-OPEN**: Chưa có relation type/valid triple canonical cho quan hệ này.
```

## Sau Khi Draft

1. Chạy `meta-validate`.
2. Kiểm tra `docs/guide/workflows/trace-impact.md` nếu có relation.
3. Nếu có `theory_basis`, cân nhắc `theory-review`.
