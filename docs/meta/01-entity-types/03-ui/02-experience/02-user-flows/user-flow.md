# UserFlow

| Field | Value |
|-------|-------|
| **name** | UserFlow |
| **layer** | `03-ui` |
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

## allowed relations (candidate)

```text
UserFlow → Screen (traverses)
UserFlow → UseCase (implements)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt User Flow vs technical routing
