# Unit Structure - Entity

Template này dùng cho entity instance trong `docs/app/**/<ID-slug>/README.md`.

Schema canonical: [entity-instance.md](../../../meta/00-schemas/entity-instance.md).

## YAML Frontmatter

```yaml
---
schema: entity-instance/v1
id: BRULE-001
slug: human-review-before-jira-write
title: Human Review Before Jira Write
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Jira write phải đi qua human review.
theory_basis:
  - TH-HUBFLOW
decision_basis:
  - DEC-001
relations:
  governs:
    - PROC-001
---
```

## Markdown Body

```md
# BRULE-001 - Human Review Before Jira Write

## Summary

Jira write phải đi qua human review.

## Meaning

Entity này có meaning gì trong app.

## Relations

- `PROC-001` - process chịu sự chi phối của rule này.

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
