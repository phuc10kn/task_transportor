# Goal

| Field | Value |
|-------|-------|
| **name** | Goal |
| **layer** | `01-business` |
| **concern** | `02-direction` |
| **folder** | `goals/` |
| **ID pattern** | `GOAL-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Kết quả business muốn đạt. Không phải Feature.

## instance criteria

Khi business có outcome mong muốn rõ ràng.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Statement, Reason, Priority, Relations, Validation Notes

## optional fields

target_outcome, related_problems, time_horizon, owner, theory_basis

## lifecycle

draft → active → achieved | abandoned

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Statement`
- `Reason`
- `Priority`

Optional sections:

- `Target Outcome`
- `Time Horizon`
- `Owner`

Additional validation:

- Goal phải là outcome business, không phải feature, screen hoặc implementation task.

## allowed relations (candidate)

```text
Goal → Problem (addresses)
Goal → SuccessCriterion (measured_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không viết solution cụ thể (dashboard, API, ...)
