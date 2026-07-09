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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| derived_from | `derived_from` | Problem | allowed_when_known | 0..n |
| satisfied_by | `satisfied_by` | Capability | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không mô tả solution quá cụ thể (PostgreSQL, button, ...)


