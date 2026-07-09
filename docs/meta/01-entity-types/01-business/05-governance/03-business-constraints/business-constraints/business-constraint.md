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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| constrains | `constrains` | Process | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt ContextConstraint vs BusinessConstraint


