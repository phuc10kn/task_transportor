# Unit Structure - Decision

Template này dùng cho decision trong `docs/app/10-decisions/`.

Decision là app-specific choice/trade-off. Theory là reusable reasoning; không trộn hai thứ này.

Schema canonical: [decision.md](../../../meta/00-schemas/decision.md).

## YAML Frontmatter

```yaml
---
schema: decision/v1
id: DEC-001
slug: use-cis-as-sync-hub
title: Use CIS As Sync Hub
status: accepted
summary: Đồng bộ phải đi qua CIS thay vì Backlog -> Jira trực tiếp.
affected_layers:
  - 00-context
  - 01-business
  - 02-product
  - 05-architecture
theory_basis:
  - TH-HUBFLOW
review_triggers:
  - Medium scope mở Jira inbound đầy đủ.
---
```

## Markdown Body

```md
# DEC-001 - Use CIS As Sync Hub

## Status

accepted

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
