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

## allowed relations (candidate)

```text
Release → Feature (includes)
Release → Scope (aligns_with)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không nhầm Product Release với Operation Deployment
