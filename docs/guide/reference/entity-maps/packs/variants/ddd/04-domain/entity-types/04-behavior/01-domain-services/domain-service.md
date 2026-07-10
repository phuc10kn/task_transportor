# DomainService

| Field | Value |
|-------|-------|
| **name** | DomainService |
| **layer** | `04-domain` |
| **concern** | `04-behavior` |
| **folder** | `domain-services/` |
| **ID pattern** | `DSVC-{NNN}-{slug}` |

## meaning

Domain behavior không thuộc tự nhiên về một Entity hoặc Value Object.

## instance criteria

Khi operation span nhiều entity hoặc không có natural owner.

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, business_meaning

## optional fields

inputs, outputs, rules_used, affected_model

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| operates_on | `operates_on` | DomainEntity | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không dùng Domain Service cho mọi business logic
