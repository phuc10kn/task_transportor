# ContextConstraint

| Field | Value |
|-------|-------|
| **name** | ContextConstraint |
| **layer** | `00-context` |
| **concern** | `03-premises` |
| **folder** | `constraints/` |
| **ID pattern** | `CON-{NNN}-{slug}` |

## meaning

Giới hạn toàn project mà project phải tuân thủ.

## instance criteria

Khi constraint áp dụng cross-layer.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, source, scope, strength

## optional fields

affected_layers, affected_entities, exceptions, theory_basis

## lifecycle

active → relaxed | retired

## allowed relations (candidate)

```text
ContextConstraint → layers/entities (constrains)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Assumption, ContextConstraint, BusinessConstraint
