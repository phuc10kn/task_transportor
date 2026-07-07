# UseCase

| Field | Value |
|-------|-------|
| **name** | UseCase |
| **layer** | `02-product` |
| **concern** | `03-behavior` |
| **folder** | `use-cases/` |
| **ID pattern** | `UC-{NNN}-{slug}` |

## meaning

Cách actor tương tác với Product để đạt mục tiêu.

## instance criteria

Khi cần document product behavior ở mức actor-goal.

## required fields

id, slug, entity_type, layer, concern, status

Body: actor, goal, main_flow

## optional fields

preconditions, trigger, alternative_flows, exceptions, postconditions, related_capabilities

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
UseCase → Capability (uses)
UseCase → Feature (implemented_by)
UseCase → UserFlow (refined_in)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả UI detail (button color, position)
