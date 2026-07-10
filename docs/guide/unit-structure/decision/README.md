# Unit Structure - Decision

Template này dùng cho decision trong `docs/app/10-decisions/`.

Decision là app-specific choice/trade-off. Theory là reusable reasoning; không trộn hai thứ này.

Schema canonical: [decision.md](../../../meta/00-schemas/decision.md).

## YAML Frontmatter

```yaml
---
schema: decision/v1
id: DEC-<NNN>
slug: <decision-slug>
title: <Decision Title>
status: <project-defined-status>
summary: <Decision summary.>
affected_layers:
  - <NN-layer>
theory_basis:
  - <TH-...>
review_triggers:
  - <Condition that requires review.>
---
```

## Markdown Body

```md
# DEC-<NNN> - <Decision Title>

## Status

<project-defined-status>

## Decision

## Context

## Theory Basis

## Affected Layers

## Affected Entities

## Alternatives Considered

## Consequences

## Review Triggers
```

## Rule

- Decision phải ghi `why`, không chỉ ghi kết quả.
- Decision impact lớn cần human approval trước khi accepted.
- Decision cũ không xóa; dùng `superseded`, `deprecated`, `rejected`.
