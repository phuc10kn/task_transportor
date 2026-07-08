# Metric

| Field | Value |
|-------|-------|
| **name** | Metric |
| **layer** | `01-business` |
| **concern** | `06-measurement` |
| **folder** | `metrics/` |
| **ID pattern** | `METRIC-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Đại lượng được đo để đánh giá business.

## instance criteria

Khi business cần theo dõi đại lượng cụ thể.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Definition, Unit, Source, Relations, Validation Notes

## optional fields

calculation, source, frequency, owner, baseline

## lifecycle

active → deprecated

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Definition`
- `Unit`
- `Source`

Optional sections:

- `Calculation`
- `Frequency`
- `Owner`
- `Baseline`

Additional validation:

- Metric là đại lượng đo, không phải ngưỡng đạt/chưa đạt.

## allowed relations (candidate)

```text
Metric → Goal (measures)
Metric → SuccessCriterion (input_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Metric vs SuccessCriterion
