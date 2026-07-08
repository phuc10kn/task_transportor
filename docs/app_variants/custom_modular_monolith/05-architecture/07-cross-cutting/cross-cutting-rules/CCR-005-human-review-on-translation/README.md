---
id: CCR-005
slug: human-review-on-translation
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-05
---

# CCR-005 - Human Review On Translation

## Meaning

AI draft không tự trở thành canonical issue content nếu chưa qua review path phù hợp.

## Statement

Translation draft đi vào queue để approve, reject hoặc manual edit; canonical update chỉ xảy ra khi reviewed result được apply qua `Cis`.

## Scope

`Translation`, `Cis`, `Anomaly`, admin workflow

## Evidence

- `src/modules/Translation/application/approveTranslation.js`
- `src/modules/Cis/application/applyReviewedIssueTranslation.js`
