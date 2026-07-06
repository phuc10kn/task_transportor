# Goal

| Field | Value |
|-------|-------|
| **name** | Goal |
| **layer** | `01-business` |
| **concern** | `02-direction` |
| **folder** | `goals/` |
| **ID pattern** | `GOAL-{NNN}-{slug}` |

## meaning

Kết quả business muốn đạt. Không phải Feature.

## instance criteria

Khi business có outcome mong muốn rõ ràng.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, reason, priority

## optional fields

target_outcome, related_problems, time_horizon, owner, theory_basis

## lifecycle

draft → active → achieved | abandoned

## allowed relations (candidate)

```text
Goal → Problem (addresses)
Goal → SuccessCriterion (measured_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không viết solution cụ thể (dashboard, API, ...)
