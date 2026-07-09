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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| part_of | `part_of` | Scenario | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không mô tả API, database, technical implementation

