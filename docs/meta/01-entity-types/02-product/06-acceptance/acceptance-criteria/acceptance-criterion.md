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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| accepts_functional_requirements | `accepts` | FunctionalRequirement | allowed_when_known | 0..n |
| accepts_features | `accepts` | Feature | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không phải full test case


