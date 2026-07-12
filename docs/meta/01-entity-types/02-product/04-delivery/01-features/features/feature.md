# Feature

| Field | Value |
|-------|-------|
| **name** | Feature |
| **layer** | `02-product` |
| **concern** | `04-delivery` |
| **folder** | `features/` |
| **ID pattern** | `FE-{NNN}` |
| **Instance folder pattern** | `FE-{NNN}-{slug}` |

## meaning

Đơn vị chức năng có giá trị rõ với người dùng hoặc Product.

## instance criteria

Khi product deliverable có boundary rõ.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, value, scope

## optional fields

supported_capabilities, supported_use_cases, requirements, priority, release, theory_basis

## lifecycle

planned → active → retired

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| implements | `implements` | Capability | allowed_when_known | 0..n |
| exposed_via | `exposed_via` | Screen | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không chứa implementation detail

