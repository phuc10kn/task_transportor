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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| contains | `contains` | DomainEntity | allowed_when_known | 0..n |
| enforces | `enforces` | Invariant | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không phải mọi Entity đều là Aggregate Root


