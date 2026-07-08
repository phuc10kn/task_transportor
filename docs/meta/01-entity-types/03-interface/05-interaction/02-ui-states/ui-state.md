# UIState

| Field | Value |
|-------|-------|
| **name** | UIState |
| **layer** | `03-interface` |
| **concern** | `05-interaction` |
| **folder** | `ui-states/` |
| **ID pattern** | `UIST-{NNN}-{slug}` |

## meaning

Trạng thái UI người dùng có thể quan sát.

## instance criteria

Khi state quan trọng: loading, empty, error, permission denied.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, meaning

## optional fields

entry_conditions, exit_conditions, user_expectations, related_screens

## lifecycle

defined → active

## allowed relations (candidate)

```text
UIState → Screen (displayed_on)
UIState → Interaction (triggered_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- UI state ≠ domain state ≠ workflow state
