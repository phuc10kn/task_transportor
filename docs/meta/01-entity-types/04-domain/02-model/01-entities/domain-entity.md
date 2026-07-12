# DomainEntity

| Field | Value |
|-------|-------|
| **name** | DomainEntity |
| **layer** | `04-domain` |
| **concern** | `02-model` |
| **folder** | `entities/` |
| **ID pattern** | `ENT-{NNN}` |
| **Instance folder pattern** | `ENT-{NNN}-{slug}` |

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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| uses | `uses` | ValueObject | allowed_when_known | 0..n |

Không có slot `member_of`. Aggregate membership ghi từ `Aggregate --contains--> DomainEntity`.

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Domain Entity ≠ database table document

