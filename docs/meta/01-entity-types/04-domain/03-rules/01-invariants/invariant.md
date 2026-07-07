# Invariant

| Field | Value |
|-------|-------|
| **name** | Invariant |
| **layer** | `04-domain` |
| **concern** | `03-rules` |
| **folder** | `invariants/` |
| **ID pattern** | `INV-{NNN}-{slug}` |

## meaning

Điều phải luôn đúng trong scope domain nhất định.

## instance criteria

Khi domain model có condition bắt buộc luôn đúng.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope

## optional fields

affected_model, violation_meaning, enforcement_expectation, related_business_rules

## lifecycle

draft → active → superseded

## allowed relations (candidate)

```text
Invariant → DomainEntity (applies_to)
Invariant → BusinessRule (refined_from)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Domain Invariant ≠ Business Rule
