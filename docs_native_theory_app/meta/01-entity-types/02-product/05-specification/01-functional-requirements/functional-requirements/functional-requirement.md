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

## allowed relations (candidate)

```text
FunctionalRequirement → Feature (specifies)
FunctionalRequirement → AcceptanceCriterion (verified_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Đủ cụ thể để verify, không mô tả code
