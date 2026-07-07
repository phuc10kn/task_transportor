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

## allowed relations (candidate)

```text
NonFunctionalRequirement → Feature (constrains)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả technical solution (Redis, CDN, ...)
