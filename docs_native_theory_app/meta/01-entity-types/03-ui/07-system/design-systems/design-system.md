# DesignSystem

| Field | Value |
|-------|-------|
| **name** | DesignSystem |
| **layer** | `03-ui` |
| **concern** | `07-system` |
| **folder** | `design-systems/` |
| **ID pattern** | `DS-{NNN}-{slug}` |

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

## allowed relations (candidate)

```text
DesignSystem → UIComponent (governs)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không document mọi CSS token nếu không có knowledge value
