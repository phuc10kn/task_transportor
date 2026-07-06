# BusinessRequirement

| Field | Value |
|-------|-------|
| **name** | BusinessRequirement |
| **layer** | `02-product` |
| **concern** | `01-needs` |
| **folder** | `business-requirements/` |
| **ID pattern** | `BR-{NNN}-{slug}` |

## meaning

Nhu cầu Product phải đáp ứng từ business problem hoặc goal.

## instance criteria

Khi product cần requirement ở mức need, chưa cụ thể solution.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, source, expected_outcome

## optional fields

stakeholders, priority, scope, related_business_entities, theory_basis

## lifecycle

draft → active → satisfied | cancelled

## allowed relations (candidate)

```text
BusinessRequirement → Problem (derived_from)
BusinessRequirement → Capability (satisfied_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả solution quá cụ thể (PostgreSQL, button, ...)
