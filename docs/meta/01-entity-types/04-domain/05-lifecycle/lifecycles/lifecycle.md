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

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| describes | `describes` | DomainEntity | false | 0..n |
| emits | `emits` | DomainEvent | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Lifecycle domain ≠ UI state ≠ workflow state
