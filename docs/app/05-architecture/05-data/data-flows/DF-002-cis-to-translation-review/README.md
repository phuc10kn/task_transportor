---
schema: entity-instance/v1
id: DF-002
slug: cis-to-translation-review
title: CIS To Translation Review
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
summary: Luồng cung cấp context issue/project từ CIS sang Translation để tạo và review bản dịch.
theory_basis:
  - TH-AI-GOV-01
  - TH-CANON-03
relations:
  moves:
    - SO-002
---
# DF-002 - CIS To Translation Review

## Summary

Luồng cung cấp context issue/project từ CIS sang Translation để tạo và review bản dịch.

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
  -> translation_queue / review state
```

## Transformation

Context được chọn lọc, build thành translation input, rồi sinh draft qua adapter AI.

## Boundary and ownership

- `Cis` vẫn sở hữu issue state nguồn.
- `Translation` sở hữu state review mới được sinh ra từ context đó.
- Reviewed result quay về `Cis` qua data flow riêng DF-005, không phải write trực tiếp từ queue sang issue tables.

## Read / write tiers involved

Read/write đi qua owner API, orchestration hoặc worker path phù hợp; không dùng flow để hợp thức hóa cross-module write trực tiếp.

## Architectural payoff

- Tách draft/review lifecycle khỏi canonical issue lifecycle.
- Cho phép manual edit, reject hoặc retranslate mà không phá source-of-truth.
- Giữ ranh giới rõ giữa AI transport và business review process.



## What changes and what does not

Flow chỉ thay đổi hoặc truyền dữ liệu theo Data path và Transformation đã nêu; ownership không tự chuyển ngoài boundary được mô tả.

## Anti-patterns avoided

Không để external/raw payload trở thành canonical state, không bypass owner và không coi preview là outbound write.

## Relations

`moves` ghi translation review state được tạo từ context. SO-001 ghi `shared_via` tới flow này vì chỉ expose canonical context, không đổi ownership.

## Evidence

- `src/modules/Translation/application/collectTranslationContext.js`
- `src/modules/Translation/application/buildStandardTranslationInput.js`
- `src/modules/Translation/application/requestIssueTranslations.js`

## Related Entities

- Context/evidence: [MOD-003-translation](../../../01-structure/modules/MOD-003-translation/README.md) - owner của review state
- Context/evidence: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md) - owner của canonical issue state
- Canonical relation: [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md) - context nguồn được expose
- Canonical relation: [SO-002-translation-review-state](../../../04-state/state-owners/SO-002-translation-review-state/README.md) - state đích của flow review

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
