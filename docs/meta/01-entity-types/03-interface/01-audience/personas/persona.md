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

## allowed relations (candidate)

```text
Persona → Stakeholder (maps_from)
Persona → Journey (undertakes)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Persona vs Stakeholder
