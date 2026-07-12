# Capability

| Field | Value |
|-------|-------|
| **name** | Capability |
| **layer** | `02-product` |
| **concern** | `02-capabilities` |
| **folder** | `capabilities/` |
| **ID pattern** | `CAP-{NNN}` |
| **Instance folder pattern** | `CAP-{NNN}-{slug}` |

## meaning

Khả năng Product phải có, độc lập với UI.

## instance criteria

Khi product có ability ổn định cần trace.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, purpose

## optional fields

related_requirements, users_or_actors, inputs, outputs, boundaries, maturity

## lifecycle

planned → active → deprecated

## relations_template

Hiện không có outbound relation slot canonical.

Trace Feature cover Capability bằng reverse query từ fact gốc:

```text
Feature --implements--> Capability
```

Không dùng `Capability --delivered_by--> Feature` như dual/mirror của fact trên.

## validation

- Không mô tả screen, API endpoint, class


