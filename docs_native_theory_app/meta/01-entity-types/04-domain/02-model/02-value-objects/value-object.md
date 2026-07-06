# ValueObject

| Field | Value |
|-------|-------|
| **name** | ValueObject |
| **layer** | `04-domain` |
| **concern** | `02-model` |
| **folder** | `value-objects/` |
| **ID pattern** | `VO-{NNN}-{slug}` |

## meaning

Object được nhận diện bằng value, không cần identity riêng.

## instance criteria

Khi value có validity rules hoặc equality semantics quan trọng.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, meaning, attributes

## optional fields

validity_rules, equality_semantics, operations

## lifecycle

modeled → active

## allowed relations (candidate)

```text
ValueObject → DomainEntity (used_by)
ValueObject → Invariant (constrained_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Nên immutable, self-validating trong model
