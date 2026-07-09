# Navigation

| Field | Value |
|-------|-------|
| **name** | Navigation |
| **layer** | `03-interface` |
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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| connects | `connects` | Screen | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- UI Navigation ≠ technical routing


