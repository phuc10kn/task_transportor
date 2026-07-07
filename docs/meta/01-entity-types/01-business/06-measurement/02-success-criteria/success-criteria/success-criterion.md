# SuccessCriterion

| Field | Value |
|-------|-------|
| **name** | SuccessCriterion |
| **layer** | `01-business` |
| **concern** | `06-measurement` |
| **folder** | `success-criteria/` |
| **ID pattern** | `SC-{NNN}-{slug}` |

## meaning

Điều kiện xác định kết quả đã đạt hay chưa.

## instance criteria

Khi Goal cần tiêu chí đạt/không đạt rõ ràng.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, condition

## optional fields

related_goals, related_metrics, validation_method

## lifecycle

draft → active → achieved | retired

## allowed relations (candidate)

```text
SuccessCriterion → Goal (validates)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Metric (đo) vs SuccessCriterion (đạt/chưa đạt)
