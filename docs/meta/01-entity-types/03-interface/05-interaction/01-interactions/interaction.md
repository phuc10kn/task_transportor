# Interaction

| Field | Value |
|-------|-------|
| **name** | Interaction |
| **layer** | `03-interface` |
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

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| occurs_on | `occurs_on` | Screen | false | 0..n |
| transitions_to | `transitions_to` | UIState | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Mô tả UX behavior, không mô tả event handler code
