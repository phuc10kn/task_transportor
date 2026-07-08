# Form

| Field | Value |
|-------|-------|
| **name** | Form |
| **layer** | `03-interface` |
| **concern** | `04-composition` |
| **folder** | `forms/` |
| **ID pattern** | `FORM-{NNN}-{slug}` |

## meaning

Cấu trúc interaction thu thập hoặc thay đổi dữ liệu.

## instance criteria

Khi form có validation expectations hoặc workflow quan trọng.

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, fields

## optional fields

field_groups, validation_expectations, submission_behavior, error_behavior, related_use_cases

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
Form → Screen (contained_in)
Form → Interaction (submits_via)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không chứa validation implementation detail
