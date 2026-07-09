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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| applied_by | `applied_by` | DomainService | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không mô tả technical policy (IAM, firewall)


