---
id: SO-002
slug: translation-review-state
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
theory_basis:
  - TH-AI-GOV-01
  - TH-AI-GOV-04
---

# SO-002 - Translation Review State

## Meaning

State của queue item dịch, draft, review outcome và manual edit trước khi áp vào canonical issue.

## Owner

`Translation`

## Reason

Review lifecycle là concern riêng của translation, tách khỏi canonical issue ownership của `Cis`.

## Write policy

- `Translation` write `translation_queue`.
- `Cis` chỉ apply reviewed result vào canonical issue, không nhận ownership review queue.

## Consumers

- `Cis`
- `Dashboard`
- `Jira` đọc snapshot liên quan

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Translation/TranslationApi.js`
