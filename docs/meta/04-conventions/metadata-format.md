# Metadata Format

Schema canonical: [entity-instance.md](../00-schemas/entity-instance.md).

YAML frontmatter bắt buộc cho Entity Instance:

```yaml
---
schema: entity-instance/v1
id: MOD-004
slug: spec-graph
title: Spec Graph
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: draft
summary: Module mô tả spec graph.
theory_basis:
  - TH-MOD-03
decision_basis:
  - DEC-021
relations:
  governed_by:
    - BRULE-001
---
```

## Required fields

```text
schema, id, slug, title, entity_type, layer, concern, status, summary
```

Các field này bắt buộc cho file mới hoặc file được sửa. File legacy chưa có `schema` được infer theo path; khi sửa file đó phải bổ sung `schema: entity-instance/v1`.

## Optional fields

```text
theory_basis, decision_basis, relations, tags, owner, created, updated
```

## relations block

```yaml
relations:
  affects_problems:
    - PROB-001-manual-reconciliation
```

Key dưới `relations` là slot name đã định nghĩa trong `relations_template` của entity type.

Mỗi target là ID hoặc path tới instance. Relation slot phải resolve được tới relation type, target entity type và valid triple tương ứng.
