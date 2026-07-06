# BusinessConstraint

| Field | Value |
|-------|-------|
| **name** | BusinessConstraint |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `business-constraints/` |
| **ID pattern** | `BCON-{NNN}-{slug}` |

## meaning

Giới hạn riêng của business operation.

## instance criteria

Khi constraint gắn với regulatory hoặc operational business.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, source

## optional fields

scope, affected_processes, exceptions

## lifecycle

active → relaxed | retired

## allowed relations (candidate)

```text
BusinessConstraint → Process (constrains)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt ContextConstraint vs BusinessConstraint
