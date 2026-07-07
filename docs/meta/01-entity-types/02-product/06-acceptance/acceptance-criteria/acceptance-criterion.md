# AcceptanceCriterion

| Field | Value |
|-------|-------|
| **name** | AcceptanceCriterion |
| **layer** | `02-product` |
| **concern** | `06-acceptance` |
| **folder** | `acceptance-criteria/` |
| **ID pattern** | `AC-{NNN}-{slug}` |

## meaning

Điều kiện xác nhận requirement đã đáp ứng.

## instance criteria

Khi cần điều kiện Given/When/Then hoặc tương đương.

## required fields

id, slug, entity_type, layer, concern, status

Body: condition, expected_result

## optional fields

related_requirement, related_feature, validation_method

## lifecycle

draft → active → passed | failed

## allowed relations (candidate)

```text
AcceptanceCriterion → FunctionalRequirement (accepts)
AcceptanceCriterion → Feature (accepts)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không phải full test case
