# UIComponent

| Field | Value |
|-------|-------|
| **name** | UIComponent |
| **layer** | `03-interface` |
| **concern** | `04-composition` |
| **folder** | `components/` |
| **ID pattern** | `CMP-{NNN}-{slug}` |

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

## allowed relations (candidate)

```text
UIComponent → Screen (used_in)
UIComponent → DesignSystem (follows)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không document Button, Spacer nếu chỉ là primitive
