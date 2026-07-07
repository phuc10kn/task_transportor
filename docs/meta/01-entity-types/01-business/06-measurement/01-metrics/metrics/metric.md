# Metric

| Field | Value |
|-------|-------|
| **name** | Metric |
| **layer** | `01-business` |
| **concern** | `06-measurement` |
| **folder** | `metrics/` |
| **ID pattern** | `METRIC-{NNN}-{slug}` |

## meaning

Đại lượng được đo để đánh giá business.

## instance criteria

Khi business cần theo dõi đại lượng cụ thể.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, definition, unit

## optional fields

calculation, source, frequency, owner, baseline

## lifecycle

active → deprecated

## allowed relations (candidate)

```text
Metric → Goal (measures)
Metric → SuccessCriterion (input_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Metric vs SuccessCriterion
