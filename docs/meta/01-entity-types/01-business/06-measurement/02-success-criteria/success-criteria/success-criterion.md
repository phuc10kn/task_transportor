# SuccessCriterion

| Field | Value |
|-------|-------|
| **name** | SuccessCriterion |
| **layer** | `01-business` |
| **concern** | `06-measurement` |
| **folder** | `success-criteria/` |
| **ID pattern** | `SC-{NNN}` |
| **Instance folder pattern** | `SC-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Điều kiện xác định kết quả đã đạt hay chưa.

## instance criteria

Khi Goal cần tiêu chí đạt/không đạt rõ ràng.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Statement, Condition, Validation Method, Relations, Validation Notes

## optional fields

related_goals, related_metrics, validation_method

## lifecycle

draft → active → achieved | retired

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Statement`
- `Condition`
- `Validation Method`

Optional sections:

- `Related Goals`
- `Related Metrics`

Additional validation:

- SuccessCriterion là ngưỡng đạt/chưa đạt, không phải metric đo lường thuần.

## relations_template

Không có outbound slot active. Success bar của Goal ghi từ `Goal --measured_by--> SuccessCriterion`.

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt Metric (đo) vs SuccessCriterion (đạt/chưa đạt)


