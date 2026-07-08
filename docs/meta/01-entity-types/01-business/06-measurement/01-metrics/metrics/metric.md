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

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| measures | `measures` | Goal | false | 0..n |
| input_to | `input_to` | SuccessCriterion | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt Metric vs SuccessCriterion
