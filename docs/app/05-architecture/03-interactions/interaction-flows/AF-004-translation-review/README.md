---
id: AF-004
slug: translation-review
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
theory_basis:
  - TH-AI-GOV-01
  - TH-AI-GOV-04
---

# AF-004 - Translation Review

## Meaning

Luồng tạo AI draft, review và apply translation vào canonical issue.

## Trigger

Admin yêu cầu dịch issue hoặc queue item; worker chạy translate job; reviewer approve/reject/manual edit.

## Path

`Admin -> Translation HTTP -> TranslationApi -> collect context -> TranslationAdapter -> translation_queue -> approve/reject/manual edit -> CisApi.applyReviewed...`

## Outcome

Issue có translation reviewed state, và canonical fields tương ứng được cập nhật qua `Cis`.

## Related Entities

- [MOD-003-translation](../../../01-structure/modules/MOD-003-translation/README.md)
- [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md)
- [MB-004-translation-ai-separation](../../../02-boundaries/module-boundaries/MB-004-translation-ai-separation/README.md)

## Evidence

- `src/modules/Translation/application/requestIssueTranslations.js`
- `src/modules/Translation/application/approveTranslation.js`
- `src/modules/Cis/application/applyReviewedIssueTranslation.js`
