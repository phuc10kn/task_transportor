# Capability

| Field | Value |
|-------|-------|
| **name** | Capability |
| **layer** | `02-product` |
| **concern** | `02-capabilities` |
| **folder** | `capabilities/` |
| **ID pattern** | `CAP-{NNN}-{slug}` |

## meaning

Khả năng Product phải có, độc lập với UI.

## instance criteria

Khi product có ability ổn định cần trace.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, purpose

## optional fields

supported_requirements, users_or_actors, inputs, outputs, boundaries, maturity

## lifecycle

planned → active → deprecated

## allowed relations (candidate)

```text
Capability → BusinessRequirement (supports)
Capability → Feature (delivered_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả screen, API endpoint, class
