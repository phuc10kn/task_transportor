# Unit Structure - Entity

Template này dùng cho entity instance trong `docs/app/**/<ID-slug>/README.md`.

Schema canonical: [entity-instance.md](../../../meta/00-schemas/entity-instance.md).

## YAML Frontmatter

```yaml
---
schema: entity-instance/v1
id: PROC-001
slug: backlog-to-cis-lite
title: Backlog To CIS Lite Flow
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Business flow Lite từ Backlog vào CIS.
theory_basis:
  - TH-HUBFLOW
decision_basis:
  - DEC-001
relations:
  governed_by:
    - BRULE-001
---
```

## Markdown Body

```md
# PROC-001 - Backlog To CIS Lite Flow

## Summary

Business flow Lite từ Backlog vào CIS.

## Meaning

Entity này có meaning gì trong app.

## Relations

- `BRULE-001` - rule chi phối flow này.

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
