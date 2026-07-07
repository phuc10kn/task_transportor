# DomainPolicy

| Field | Value |
|-------|-------|
| **name** | DomainPolicy |
| **layer** | `04-domain` |
| **concern** | `03-rules` |
| **folder** | `domain-policies/` |
| **ID pattern** | `DPOL-{NNN}-{slug}` |

## meaning

Rule quyết định cách domain behavior được lựa chọn.

## instance criteria

Khi behavior phụ thuộc điều kiện domain phức tạp.

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, decision_logic

## optional fields

inputs, outputs, applicable_conditions, exceptions, related_entities

## lifecycle

draft → active → superseded

## allowed relations (candidate)

```text
DomainPolicy → DomainService (applied_by)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả technical policy (IAM, firewall)
