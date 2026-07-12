# DesignSystem

| Field | Value |
|-------|-------|
| **name** | DesignSystem |
| **layer** | `03-interface` |
| **concern** | `07-system` |
| **folder** | `design-systems/` |
| **ID pattern** | `DS-{NNN}` |
| **Instance folder pattern** | `DS-{NNN}-{slug}` |

## meaning

Nền tảng giữ consistency cho toàn bộ UI.

## instance criteria

Khi project có design language, tokens, patterns canonical.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, principles

## optional fields

tokens, component_categories, usage_rules, composition_rules, accessibility_baseline

## lifecycle

draft → active → evolved

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| governs | `governs` | UIComponent | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không document mọi CSS token nếu không có knowledge value


