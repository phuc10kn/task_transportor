# Policy

| Field | Value |
|-------|-------|
| **name** | Policy |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `policies/` |
| **ID pattern** | `POL-{NNN}-{slug}` |

## meaning

Định hướng hoặc chính sách quản trị rộng hơn một rule.

## instance criteria

Khi policy có thể sinh nhiều Business Rule.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope

## optional fields

owner, derived_rules, exceptions

## lifecycle

draft → active → superseded

## allowed relations (candidate)

```text
Policy → BusinessRule (generates)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Policy rộng hơn single rule
