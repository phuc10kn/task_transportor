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

## allowed relations (candidate)

```text
Stakeholder → Problem (affected_by)
Stakeholder → Process (participates_in)
Stakeholder → Persona (may_map_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Stakeholder vs Persona
