# FunctionalRequirement

| Field | Value |
|-------|-------|
| **name** | FunctionalRequirement |
| **layer** | `02-product` |
| **concern** | `05-specification` |
| **folder** | `functional-requirements/` |
| **ID pattern** | `FR-{NNN}-{slug}` |

## meaning

Product phải thực hiện hành vi cụ thể nào.

## instance criteria

Khi requirement đủ cụ thể để review, implement, verify.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, expected_behavior

## optional fields

trigger, conditions, exceptions, related_feature, related_use_case, priority

## lifecycle

draft → active → verified | superseded

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| specifies | `specifies` | Feature | false | 0..n |
| verified_by | `verified_by` | AcceptanceCriterion | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Đủ cụ thể để verify, không mô tả code
