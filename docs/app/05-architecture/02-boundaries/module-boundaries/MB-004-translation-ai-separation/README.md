---
schema: entity-instance/v1
id: MB-004
slug: translation-ai-separation
title: Translation AI Separation
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
summary: Boundary này tách translation business logic khỏi transport detail AI.
theory_basis:
  - TH-AI-GOV-02
  - TH-AI-GOV-03
relations:
  constrains:
    - MOD-003
  constrains_state_owner:
    - SO-002
---
# MB-004 - Translation AI Separation

## Summary

Boundary này tách translation business logic khỏi transport detail AI.

## Meaning

Boundary này tách translation business logic khỏi transport detail AI.

## Statement

`Translation` sở hữu prompt, parse output, review state và audit. HTTP/process mechanics thuộc `src/infrastructure/ai`, không thuộc `src/modules/Translation`.

## Protected assets

- review lifecycle của `translation_queue`
- khả năng thay transport mà không phá business logic
- module boundary giữa domain logic và external client mechanics

## Allowed / forbidden

- Được phép: `TranslationAdapter`, `ProcessTranslationAdapter`, config mapping.
- Bị cấm: `fetch`, `child_process`, `spawn`, `spawnSync` bên trong `src/modules/Translation`.

## Related Entities

- Canonical relation: [MOD-003-translation](../../../01-structure/modules/MOD-003-translation/README.md) - module chịu boundary này
- Canonical relation: [SO-002-translation-review-state](../../../04-state/state-owners/SO-002-translation-review-state/README.md) - state mà module này sở hữu



## Why this boundary matters

Boundary này tách translation business logic khỏi transport detail AI. Boundary này giữ owner, access hoặc write discipline không bị mơ hồ khi code thay đổi.

## Architectural consequences

Module chịu boundary này phải giữ public API, owner-write discipline và các read/write exception đã được nêu trong Statement.

## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Translation/infrastructure/TranslationAdapter.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
