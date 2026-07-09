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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| raised_by | `raised_by` | Aggregate | allowed_when_known | 0..n |
| marks_transition | `marks_transition` | Lifecycle | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Domain Event ≠ technical/integration event


