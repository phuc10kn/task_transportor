# DomainEntity

| Field | Value |
|-------|-------|
| **name** | DomainEntity |
| **layer** | `04-domain` |
| **concern** | `02-model` |
| **folder** | `entities/` |
| **ID pattern** | `ENT-{NNN}-{slug}` |

## meaning

Domain object có identity ổn định theo thời gian.

## instance criteria

Khi object có identity và lifecycle trong domain.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, identity, meaning

## optional fields

properties, allowed_behavior, invariants, lifecycle, related_entities, theory_basis

## lifecycle

modeled → active → deprecated

## allowed relations (candidate)

```text
DomainEntity → Aggregate (member_of)
DomainEntity → Invariant (constrained_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Domain Entity ≠ database table document
