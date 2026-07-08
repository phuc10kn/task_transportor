# UserFlow

| Field | Value |
|-------|-------|
| **name** | UserFlow |
| **layer** | `03-interface` |
| **concern** | `02-experience` |
| **folder** | `user-flows/` |
| **ID pattern** | `FLOW-{NNN}-{slug}` |

## meaning

Đường đi cụ thể qua UI để đạt một mục tiêu.

## instance criteria

Khi cần document path qua screens với branches.

## required fields

id, slug, entity_type, layer, concern, status

Body: goal, entry_point, steps

## optional fields

decisions, branches, screens, exit_states, error_paths

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| traverses | `traverses` | Screen | false | 0..n |
| implements | `implements` | UseCase | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt User Flow vs technical routing
