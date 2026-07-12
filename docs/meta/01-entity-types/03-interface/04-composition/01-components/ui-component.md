# UIComponent

| Field | Value |
|-------|-------|
| **name** | UIComponent |
| **layer** | `03-interface` |
| **concern** | `04-composition` |
| **folder** | `components/` |
| **ID pattern** | `CMP-{NNN}` |
| **Instance folder pattern** | `CMP-{NNN}-{slug}` |

## meaning

Đơn vị UI có trách nhiệm rõ, có knowledge value.

## instance criteria

Chỉ khi component phức tạp hoặc product-specific quan trọng.

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose

## optional fields

inputs, outputs, states, variants, usage_rules, parent_screens, accessibility_requirements

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| used_in | `used_in` | Screen | allowed_when_known | 0..n |
| follows | `follows` | DesignSystem | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không document Button, Spacer nếu chỉ là primitive


