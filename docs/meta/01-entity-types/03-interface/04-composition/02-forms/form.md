# Form

| Field | Value |
|-------|-------|
| **name** | Form |
| **layer** | `03-interface` |
| **concern** | `04-composition` |
| **folder** | `forms/` |
| **ID pattern** | `FORM-{NNN}-{slug}` |

## meaning

Cấu trúc interaction thu thập hoặc thay đổi dữ liệu.

## instance criteria

Khi form có validation expectations hoặc workflow quan trọng.

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, fields

## optional fields

field_groups, validation_expectations, submission_behavior, error_behavior, related_use_cases

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| contained_in | `contained_in` | Screen | allowed_when_known | 0..n |
| submits_via | `submits_via` | Interaction | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không chứa validation implementation detail


