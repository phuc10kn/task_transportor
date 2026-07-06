---
id: MB-004
slug: translation-ai-separation
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
theory_basis:
  - TH-MOD-04
  - TH-MOD-05
---

# MB-004 - Translation AI Separation

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

- [MOD-003-translation](../../../01-structure/modules/MOD-003-translation/README.md) - module chịu boundary này
- [SO-002-translation-review-state](../../../04-state/state-owners/SO-002-translation-review-state/README.md) - state mà module này sở hữu

## Evidence

- `docs/architecture/04-boundaries.md`
- `src/modules/Translation/infrastructure/TranslationAdapter.js`
