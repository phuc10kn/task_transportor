# DomainEvent

| Field | Value |
|-------|-------|
| **name** | DomainEvent |
| **layer** | `04-domain` |
| **concern** | `04-behavior` |
| **folder** | `domain-events/` |
| **ID pattern** | `DEVT-{NNN}-{slug}` |

## meaning

Sự kiện có ý nghĩa trong domain.

## instance criteria

Khi event có business significance và consumers.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, meaning, trigger

## optional fields

source_aggregate, payload_meaning, consumers, consequences, ordering_expectations

## lifecycle

defined → active → deprecated

## allowed relations (candidate)

```text
DomainEvent → Aggregate (raised_by)
DomainEvent → Lifecycle (marks_transition)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Domain Event ≠ technical/integration event
