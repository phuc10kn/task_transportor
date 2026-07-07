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

## allowed relations (candidate)

```text
DomainService → DomainEntity (operates_on)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không dùng Domain Service cho mọi business logic
