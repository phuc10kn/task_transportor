# NonFunctionalRequirement

| Field | Value |
|-------|-------|
| **name** | NonFunctionalRequirement |
| **layer** | `02-product` |
| **concern** | `05-specification` |
| **folder** | `non-functional-requirements/` |
| **ID pattern** | `NFR-{NNN}-{slug}` |

## meaning

Quality, constraint hoặc operating expectation của Product.

## instance criteria

Khi quality attribute cần threshold đo được.

## required fields

id, slug, entity_type, layer, concern, status

Body: quality_attribute, statement, threshold

## optional fields

measurement, scope, conditions, priority

## lifecycle

draft → active → verified | superseded

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| constrains | `constrains` | Feature | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không mô tả technical solution (Redis, CDN, ...)
