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

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| used_by | `used_by` | DomainEntity | false | 0..n |
| constrained_by | `constrained_by` | Invariant | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Nên immutable, self-validating trong model
