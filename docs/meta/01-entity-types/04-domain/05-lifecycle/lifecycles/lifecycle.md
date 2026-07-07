# Lifecycle

| Field | Value |
|-------|-------|
| **name** | Lifecycle |
| **layer** | `04-domain` |
| **concern** | `05-lifecycle` |
| **folder** | `lifecycles/` |
| **ID pattern** | `LC-{NNN}-{slug}` |

## meaning

Sự tiến hóa trạng thái của domain object.

## instance criteria

Khi state machine của domain object cần document rõ.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, initial_state, states

## optional fields

allowed_transitions, transition_triggers, terminal_states, invalid_transitions, related_invariants

## lifecycle

draft → active → superseded

## allowed relations (candidate)

```text
Lifecycle → DomainEntity (describes)
Lifecycle → DomainEvent (emits)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Lifecycle domain ≠ UI state ≠ workflow state
