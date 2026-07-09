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

related_requirements, users_or_actors, inputs, outputs, boundaries, maturity

## lifecycle

planned → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| delivered_by | `delivered_by` | Feature | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không mô tả screen, API endpoint, class


