# AccessibilityRequirement

| Field | Value |
|-------|-------|
| **name** | AccessibilityRequirement |
| **layer** | `03-interface` |
| **concern** | `06-quality` |
| **folder** | `accessibility/` |
| **ID pattern** | `A11Y-{NNN}-{slug}` |

## meaning

Yêu cầu accessibility thuộc riêng UI experience.

## instance criteria

Khi a11y requirement áp dụng cho screens hoặc components.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope

## optional fields

affected_users, affected_screens, expected_behavior, validation_method, standard_reference

## lifecycle

draft → active → verified

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| constrains | `constrains` | Screen | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- 03-interface/quality ≠ 08-quality system assurance

