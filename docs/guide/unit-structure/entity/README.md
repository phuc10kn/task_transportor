# Unit Structure - Entity

Template này dùng cho entity instance trong `docs/app/**/<ID-slug>/README.md`.

Schema canonical: [entity-instance.md](../../../meta/00-schemas/entity-instance.md).

## YAML Frontmatter

```yaml
---
schema: entity-instance/v1
id: <ID-PREFIX>-001
slug: <entity-slug>
title: <Entity Title>
entity_type: <EntityType>
layer: <NN-layer>
concern: <NN-concern>
status: <project-defined-status>
summary: <One-line meaning of this entity.>
theory_basis:
  - <TH-...>
decision_basis:
  - <DEC-...>
relations:
  <relation-slot>:
    - <TARGET-ID>
---
```

## Markdown Body

```md
# <ID-PREFIX>-001 - <Entity Title>

## Summary

<One-line meaning of this entity.>

## Meaning

Entity này có meaning gì trong app.

## Relations

- `<TARGET-ID>` - <Relation context.>

## Validation Notes

- Entity type, path, relation slot, relation type và valid triple đã được kiểm tra với `docs/meta`.
```

## Extension Hook

Nếu entity type khai báo `structure extends`, thêm các section required của type đó.

Ví dụ `Process`:

```md
## Trigger

## Participants

## Steps

## Outcomes
```
