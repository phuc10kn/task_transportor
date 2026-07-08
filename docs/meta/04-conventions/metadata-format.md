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
  - type: depends_on
    target: MOD-001
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
  - type: applies_to
    target: PROB-001-manual-reconciliation
```

`type` phải là Relation Type canonical từ `02-relation-types/`.
`target` là ID hoặc path tới instance.
