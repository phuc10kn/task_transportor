# Metadata Format

YAML frontmatter bắt buộc cho Entity Instance:

```yaml
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
relations:
  - type: depends_on
    target: MOD-001
---
```

## Required fields (mọi instance)

```text
id, slug, entity_type, layer, concern, status
```

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
