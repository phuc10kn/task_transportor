# Interaction

| Field | Value |
|-------|-------|
| **name** | Interaction |
| **layer** | `03-ui` |
| **concern** | `05-interaction` |
| **folder** | `interactions/` |
| **ID pattern** | `INT-{NNN}-{slug}` |

## meaning

Hành vi giữa người dùng và UI.

## instance criteria

Khi interaction có feedback hoặc state change đáng document.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, user_action, system_response

## optional fields

precondition, feedback, state_change, failure_behavior

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
Interaction → Screen (occurs_on)
Interaction → UIState (transitions_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Mô tả UX behavior, không mô tả event handler code
