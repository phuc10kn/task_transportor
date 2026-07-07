# Navigation

| Field | Value |
|-------|-------|
| **name** | Navigation |
| **layer** | `03-ui` |
| **concern** | `03-structure` |
| **folder** | `01-navigation/` |
| **ID pattern** | `NAV-{NNN}-{slug}` |

## meaning

Cách người dùng di chuyển giữa các vùng UI.

## instance criteria

Khi navigation hierarchy hoặc model cần document.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, purpose

## optional fields

global_navigation, local_navigation, hierarchy, entry_points, exit_points, back_behavior

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
Navigation → Screen (connects)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- UI Navigation ≠ technical routing
