---
schema: entity-instance/v1
id: MOD-003
slug: translation
title: Translation
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Module review-oriented cho dịch thuật. Nó sở hữu translation queue lifecycle, tạo AI draft, cho phép approve/reject/manual edit và chỉ apply vào canonical state qua `Cis`.
theory_basis:
  - TH-MOD-01
  - TH-MOD-04
  - TH-MOD-05
  - TH-AI-GOV-01
  - TH-AI-GOV-02
  - TH-AI-GOV-04
relations:
  owns:
    - SO-002
    - SO-007
---
# MOD-003 - Translation

## Summary

Module review-oriented cho dịch thuật. Nó sở hữu translation queue lifecycle, tạo AI draft, cho phép approve/reject/manual edit và chỉ apply vào canonical state qua `Cis`.

## Meaning

Module review-oriented cho dịch thuật. Nó sở hữu translation queue lifecycle, tạo AI draft, cho phép approve/reject/manual edit và chỉ apply vào canonical state qua `Cis`.

## Responsibility

- Tạo và quản lý `translation_queue`.
- Sở hữu glossary concept với canonical/variant terms theo Project và cung cấp runtime lookup.
- Thu thập context dịch và gọi adapter trung tính.
- Quản lý approve, reject, retranslate, manual edit.
- Đồng bộ translation review state về issue summary.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Translation/TranslationApi.js`, `src/modules/Translation/http/routes.js` |
| Owned state | translation queue lifecycle, reviewed translation state |
| Main inbound | admin translate request, `Sync` translate job |
| Main outbound | `CisApi.applyReviewed...`, `AnomalyApi` khi low confidence |

## Rules / constraints

- Không được tự gọi `fetch`, `child_process`, `spawn`, `spawnSync`.
- Không sở hữu canonical issue update.
- Prompt, parse output, review state và audit translation nằm trong module này; transport detail nằm ngoài module.

## Related Entities

- Context/evidence: [MOD-001-cis](../../modules/MOD-001-cis/README.md) - owner canonical issue update
- Context/evidence: [MOD-005-anomaly](../../modules/MOD-005-anomaly/README.md) - nhận anomaly low confidence
- Context/evidence: [MOD-006-sync](../../modules/MOD-006-sync/README.md) - thực thi translate job
- Canonical relation: [MB-004-translation-ai-separation](../../../02-boundaries/module-boundaries/MB-004-translation-ai-separation/README.md) - boundary riêng cho AI
- Canonical relation: [SO-002-translation-review-state](../../../04-state/state-owners/SO-002-translation-review-state/README.md) - state owner tương ứng
- Canonical relation: [SO-007-translation-glossary-state](../../../04-state/state-owners/SO-007-translation-glossary-state/README.md) - glossary state owner tương ứng


## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Translation/TranslationApi.js`
- `src/modules/Translation/application/requestIssueTranslations.js`
- `src/modules/Translation/application/approveTranslation.js`
- `src/modules/Translation/infrastructure/TranslationAdapter.js`
- `src/modules/Translation/infrastructure/TranslationGlossaryRepository.js`
- `src/modules/Translation/http/routes.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
