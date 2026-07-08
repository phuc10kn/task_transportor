# Process

| Field | Value |
|-------|-------|
| **name** | Process |
| **layer** | `01-business` |
| **concern** | `04-behavior` |
| **folder** | `processes/` |
| **ID pattern** | `PROC-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Đơn vị hành vi nghiệp vụ: trigger, participants, steps, outcomes.

## instance criteria

Khi business operation có flow ổn định cần document.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Trigger, Participants, Steps, Outcomes, Rules, Relations, Validation Notes

## optional fields

participants, inputs, decisions, rules, exceptions, related_processes

## lifecycle

draft → active → deprecated

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Trigger`
- `Participants`
- `Steps`
- `Outcomes`

Optional sections:

- `Inputs`
- `Decisions`
- `Exceptions`
- `Related Processes`

Additional validation:

- Không mô tả API, database, technical implementation.
- Không biến process thành UI flow hoặc worker execution flow.

## allowed relations (candidate)

```text
Process → Scenario (part_of)
Process → BusinessRule (governed_by)
Process → UseCase (informs)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả API, database, technical implementation
