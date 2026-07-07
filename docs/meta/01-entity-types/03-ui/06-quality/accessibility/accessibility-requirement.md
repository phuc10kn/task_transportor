# AccessibilityRequirement

| Field | Value |
|-------|-------|
| **name** | AccessibilityRequirement |
| **layer** | `03-ui` |
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

## allowed relations (candidate)

```text
AccessibilityRequirement → Screen (applies_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- 03-ui/quality ≠ 08-quality system assurance
