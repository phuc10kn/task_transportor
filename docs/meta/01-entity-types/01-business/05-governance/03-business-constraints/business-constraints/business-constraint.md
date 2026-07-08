# BusinessConstraint

| Field | Value |
|-------|-------|
| **name** | BusinessConstraint |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `business-constraints/` |
| **ID pattern** | `BCON-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Giới hạn riêng của business operation.

## instance criteria

Khi constraint gắn với regulatory hoặc operational business.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Constraint, Reason, Impact, Relations, Validation Notes

## optional fields

scope, affected_processes, exceptions

## lifecycle

active → relaxed | retired

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Constraint`
- `Reason`
- `Impact`

Optional sections:

- `Source`
- `Affected Processes`
- `Review Trigger`

Additional validation:

- BusinessConstraint là giới hạn business, không phải config hoặc technical limitation.

## allowed relations (candidate)

```text
BusinessConstraint → Process (constrains)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt ContextConstraint vs BusinessConstraint
