# Aggregate

| Field | Value |
|-------|-------|
| **name** | Aggregate |
| **layer** | `04-domain` |
| **concern** | `02-model` |
| **folder** | `aggregates/` |
| **ID pattern** | `AGG-{NNN}-{slug}` |

## meaning

Consistency boundary trong domain.

## instance criteria

Khi cần document aggregate root và transaction boundary.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, aggregate_root

## optional fields

members, invariants, allowed_external_access, transaction_boundary, lifecycle

## lifecycle

modeled → active → refactored

## allowed relations (candidate)

```text
Aggregate → DomainEntity (contains)
Aggregate → Invariant (enforces)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không phải mọi Entity đều là Aggregate Root
