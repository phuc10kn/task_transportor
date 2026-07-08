# Policy

| Field | Value |
|-------|-------|
| **name** | Policy |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `policies/` |
| **ID pattern** | `POL-{NNN}-{slug}` |
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

## allowed relations (candidate)

```text
Policy → BusinessRule (generates)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Policy rộng hơn single rule
