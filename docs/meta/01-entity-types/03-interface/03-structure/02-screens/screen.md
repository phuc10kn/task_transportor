# Screen

| Field | Value |
|-------|-------|
| **name** | Screen |
| **layer** | `03-interface` |
| **concern** | `03-structure` |
| **folder** | `screens/` |
| **ID pattern** | `SCR-{NNN}-{slug}` |

## meaning

Đơn vị giao diện có mục đích rõ ràng.

## instance criteria

Khi screen có knowledge value (không document mọi view nhỏ).

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, primary_users

## optional fields

supported_use_cases, supported_features, entry_conditions, main_content, available_actions, states

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
Screen → Feature (supports)
Screen → UIComponent (composed_of)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả component tree chi tiết
