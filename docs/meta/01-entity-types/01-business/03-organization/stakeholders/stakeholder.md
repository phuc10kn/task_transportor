# Stakeholder

| Field | Value |
|-------|-------|
| **name** | Stakeholder |
| **layer** | `01-business` |
| **concern** | `03-organization` |
| **folder** | `stakeholders/` |
| **ID pattern** | `STK-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Bên có lợi ích hoặc bị ảnh hưởng bởi business.

## instance criteria

Khi cần document ai tham gia, quyết định, chịu trách nhiệm.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Stakeholder Type, Interests, Responsibilities, Relations, Validation Notes

## optional fields

role, responsibilities, pain_points, authority, affected_processes, related_goals

## lifecycle

active → inactive

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Stakeholder Type`
- `Interests`
- `Responsibilities`

Optional sections:

- `Authority`
- `Pain Points`
- `Affected Processes`

Additional validation:

- Stakeholder là business participant/owner, không phải UI persona.

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| affected_by | `affected_by` | Problem | false | 0..n |
| participates_in | `participates_in` | Process | false | 0..n |
| may_map_to | `may_map_to` | Persona | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt Stakeholder vs Persona
