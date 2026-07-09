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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| displayed_on | `displayed_on` | Screen | allowed_when_known | 0..n |
| triggered_by | `triggered_by` | Interaction | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- UI state ≠ domain state ≠ workflow state


