# Persona

| Field | Value |
|-------|-------|
| **name** | Persona |
| **layer** | `03-interface` |
| **concern** | `01-audience` |
| **folder** | `personas/` |
| **ID pattern** | `PER-{NNN}-{slug}` |

## meaning

Kiểu người dùng được mô hình hóa để thiết kế UI.

## instance criteria

Khi UI design cần audience model ổn định.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, role, goals

## optional fields

needs, pain_points, experience_level, usage_context, devices, accessibility_needs, related_business_roles

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| maps_from | `maps_from` | Stakeholder | allowed_when_known | 0..n |
| undertakes | `undertakes` | Journey | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt Persona vs Stakeholder


