---
schema: entity-instance/v1
id: AF-004
slug: translation-review
title: Translation Review
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Luồng tạo/chỉnh một translation draft chung và chỉ apply vào canonical khi Approve.
theory_basis:
  - TH-AI-GOV-01
  - TH-AI-GOV-04
relations:
  involves:
    - MOD-003
    - MOD-001
    - MOD-006
  changes:
    - SO-002
    - SO-001
    - SO-003
---
# AF-004 - Translation Review

## Summary

Luồng tạo/chỉnh một translation draft chung và chỉ apply vào canonical khi Approve.

## Meaning

AI hoặc operator cùng ghi một draft; Save Draft không có canonical side effect.

## Trigger

Admin yêu cầu dịch issue hoặc queue item; worker chạy translate job; operator save draft, approve, reject hoặc retranslate.

## Path

`Admin -> Translation HTTP -> TranslationApi -> collect context -> TranslationAdapter -> translation_queue.ai_draft -> save draft / approve / reject -> CisApi.applyReviewed... chỉ khi approve`

## Outcome

Queue giữ một draft thống nhất; canonical field chỉ được cập nhật qua `Cis` sau Approve.

## Related Entities

- Canonical relation: [MOD-003-translation](../../../01-structure/modules/MOD-003-translation/README.md)
- Canonical relation: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md)
- Context/evidence: [MB-004-translation-ai-separation](../../../02-boundaries/module-boundaries/MB-004-translation-ai-separation/README.md)



## Architectural role

Luồng một-draft-và-approve này là đơn vị trace cho trigger, participant, outcome và side effect kiến trúc.

## Boundaries respected

Participant chỉ đi qua owner/public API phù hợp; flow không chuyển ownership chỉ vì có orchestration hoặc side effect.

## Anti-patterns avoided

Không bypass owner state, không thực hiện side effect ngoài guardrail tương ứng và không biến flow thành mô tả payload/code-level detail.

## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Translation/application/requestIssueTranslations.js`
- `src/modules/Translation/application/approveTranslation.js`
- `src/modules/Cis/application/applyReviewedIssueTranslation.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
