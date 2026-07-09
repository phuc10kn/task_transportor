# Release

| Field | Value |
|-------|-------|
| **name** | Release |
| **layer** | `02-product` |
| **concern** | `04-delivery` |
| **folder** | `releases/` |
| **ID pattern** | `REL-{NNN}-{slug}` |

## meaning

Tập Product changes được đưa ra cùng một mốc delivery.

## instance criteria

Khi cần scope delivery theo phase hoặc milestone.

## required fields

id, slug, entity_type, layer, concern, status

Body: goal, scope

## optional fields

included_features, excluded_features, dependencies, entry_criteria, exit_criteria

## lifecycle

planned → in_progress → released → closed

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| includes | `includes` | Feature | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không nhầm Product Release với Operation Deployment


