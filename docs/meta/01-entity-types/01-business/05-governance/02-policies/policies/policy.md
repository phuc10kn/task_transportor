# Policy

| Field | Value |
|-------|-------|
| **name** | Policy |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `policies/` |
| **ID pattern** | `POL-{NNN}` |
| **Instance folder pattern** | `POL-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Định hướng hoặc chính sách quản trị rộng hơn một rule.

## instance criteria

Khi policy có thể sinh nhiều Business Rule.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Statement, Scope, Governance Intent, Relations, Validation Notes

## optional fields

owner, derived_rules, exceptions

## lifecycle

draft → active → superseded

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Statement`
- `Scope`
- `Governance Intent`

Optional sections:

- `Owner`
- `Derived Rules`
- `Exceptions`

Additional validation:

- Policy rộng hơn một rule đơn lẻ và có thể sinh nhiều BusinessRule.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| generates | `generates` | BusinessRule | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Policy rộng hơn single rule


