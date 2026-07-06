# Process

| Field | Value |
|-------|-------|
| **name** | Process |
| **layer** | `01-business` |
| **concern** | `04-behavior` |
| **folder** | `processes/` |
| **ID pattern** | `PROC-{NNN}-{slug}` |

## meaning

Đơn vị hành vi nghiệp vụ: trigger, participants, steps, outcomes.

## instance criteria

Khi business operation có flow ổn định cần document.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, trigger, steps, outcomes

## optional fields

participants, inputs, decisions, rules, exceptions, related_processes

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
Process → Scenario (part_of)
Process → BusinessRule (governed_by)
Process → UseCase (informs)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả API, database, technical implementation
