# Feature

| Field | Value |
|-------|-------|
| **name** | Feature |
| **layer** | `02-product` |
| **concern** | `04-delivery` |
| **folder** | `features/` |
| **ID pattern** | `FE-{NNN}-{slug}` |

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

## allowed relations (candidate)

```text
Feature → Capability (implements)
Feature → Release (included_in)
Feature → Screen (exposed_via)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không chứa implementation detail
