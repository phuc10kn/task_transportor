---
id: DF-002
slug: cis-to-translation-review
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
theory_basis:
  - TH-AI-GOV-01
  - TH-CANON-03
---

# DF-002 - CIS To Translation Review

## Meaning

Luồng cung cấp context issue/project từ CIS sang Translation để tạo và review bản dịch.

## Architectural role

Đây là review-oriented data flow. Nó cho phép `Translation` dùng canonical context mà không chiếm canonical ownership của `Cis`.

## Why this flow exists

- Bản dịch là một lớp xử lý nghiệp vụ riêng, không phải mutation trực tiếp của source issue.
- Hệ thống cần human review path thay vì cho AI draft ghi thẳng vào canonical state.

## Source / destination

- Source: canonical issue context và project context
- Destination: `translation_queue` và translation review workflow

## Data path

```text
Cis issue/project context
  -> collectTranslationContext(...)
  -> build translation input
  -> TranslationAdapter
  -> translation_queue
  -> reviewed result
  -> Cis apply path
```

## Transformation

Context được chọn lọc, build thành translation input, rồi sinh draft qua adapter AI.

## Boundary and ownership

- `Cis` vẫn sở hữu issue state nguồn.
- `Translation` sở hữu state review mới được sinh ra từ context đó.
- Apply reviewed result quay ngược lại `Cis` qua owner API, không phải write trực tiếp từ queue sang issue tables.

## Read / write tiers involved

- Tier 1: `Translation` đọc context issue/project tối thiểu.
- Tier 0: `Translation` chỉ write `translation_queue`, không write canonical issue state.

## Architectural payoff

- Tách draft/review lifecycle khỏi canonical issue lifecycle.
- Cho phép manual edit, reject hoặc retranslate mà không phá source-of-truth.
- Giữ ranh giới rõ giữa AI transport và business review process.

## Evidence

- `src/modules/Translation/application/collectTranslationContext.js`
- `src/modules/Translation/application/buildStandardTranslationInput.js`
- `src/modules/Translation/application/requestIssueTranslations.js`
- `src/modules/Cis/application/applyReviewedIssueTranslation.js`

## Related Entities

- [MOD-003-translation](../../../01-structure/modules/MOD-003-translation/README.md) - owner của review state
- [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md) - owner của canonical issue state
- [SO-002-translation-review-state](../../../04-state/state-owners/SO-002-translation-review-state/README.md) - state đích của flow review
