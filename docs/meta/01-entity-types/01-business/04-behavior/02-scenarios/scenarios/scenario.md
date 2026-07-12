# Scenario

| Field | Value |
|-------|-------|
| **name** | Scenario |
| **layer** | `01-business` |
| **concern** | `04-behavior` |
| **folder** | `scenarios/` |
| **ID pattern** | `SCN-{NNN}` |
| **Instance folder pattern** | `SCN-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Luồng end-to-end kết hợp nhiều Process.

## instance criteria

Khi cần mô tả journey business qua nhiều process.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Scenario Context, Composed Processes, Outcomes, Relations, Validation Notes

## optional fields

trigger, outcomes, stakeholders

## lifecycle

draft → active → deprecated

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Scenario Context`
- `Composed Processes`
- `Outcomes`

Optional sections:

- `Trigger`
- `Stakeholders`
- `Exceptions`

Additional validation:

- Scenario là end-to-end business situation, không phải UI journey hoặc architecture flow.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| composes | `composes` | Process | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Flow diagram chỉ là view, không phải Entity Type


