---
id: CCR-003
slug: job-for-heavy-side-effects
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
theory_basis:
  - TH-MOD-05
---

# CCR-003 - Job For Heavy Side Effects

## Meaning

Những path nặng, batch hoặc cần retry nên đi qua `Sync`.

## Statement

Project pull, scheduled pull, translate job và outbound push dùng execution path có hàng đợi và journal thay vì nhồi toàn bộ vào request lifecycle.

## Scope

`Backlog`, `Translation`, `Sync`, `Jira`

## Evidence

- `src/modules/Backlog/application/pullProject.js`
- `src/modules/Translation/application/retranslateTranslation.js`
- `src/modules/Jira/application/requestJiraSync.js`
