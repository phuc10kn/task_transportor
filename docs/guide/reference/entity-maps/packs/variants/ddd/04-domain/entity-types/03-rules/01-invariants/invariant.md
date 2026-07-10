# Invariant

| Field | Value |
|-------|-------|
| **name** | Invariant |
| **layer** | `04-domain` |
| **concern** | `03-rules` |
| **folder** | `invariants/` |
| **ID pattern** | `INV-{NNN}-{slug}` |

## meaning

Điều phải luôn đúng trong scope domain nhất định.

## instance criteria

Khi domain model có condition bắt buộc luôn đúng.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope

## optional fields

affected_model, violation_meaning, enforcement_expectation, related_business_rules

## lifecycle

draft → active → superseded

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| constrains_domain_entity | `constrains` | DomainEntity | allowed_when_known | 0..n |
| constrains_value_object | `constrains` | ValueObject | allowed_when_known | 0..n |
| refined_from | `refined_from` | BusinessRule | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Domain Invariant ≠ Business Rule
