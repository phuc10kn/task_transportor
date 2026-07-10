---
schema: entity-instance/v1
id: CCR-005
slug: human-review-on-translation
title: Human Review On Translation
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
summary: AI draft không tự trở thành canonical issue content nếu chưa qua review path phù hợp.
theory_basis:
  - TH-AI-GOV-01
  - TH-AI-GOV-04
  - TH-CANON-04
relations:
  constrains:
    - MOD-003
    - MOD-001
    - MOD-005
  constrains_state_owner:
    - SO-002
    - SO-001
---
# CCR-005 - Human Review On Translation

## Summary

AI draft không tự trở thành canonical issue content nếu chưa qua review path phù hợp.

## Meaning

AI draft không tự trở thành canonical issue content nếu chưa qua review path phù hợp.

## Statement

Translation draft đi vào queue để approve, reject hoặc manual edit; canonical update chỉ xảy ra khi reviewed result được apply qua `Cis`.

## Scope

`Translation`, `Cis`, `Anomaly`, admin workflow



## Why this rule exists

AI draft không tự trở thành canonical issue content nếu chưa qua review path phù hợp. Rule này giữ một invariant kiến trúc cần được review khi flow hoặc module liên quan thay đổi.

## Design consequences

Thiết kế mới hoặc thay đổi phải tuân thủ Statement và Scope; rule không tự tạo ownership hoặc relation canonical mới.

## Review questions this rule forces

Thay đổi này có bypass Statement, làm mơ hồ owner/boundary, hoặc làm mất guardrail đã nêu không?

## Anti-patterns avoided

Scope và Statement xác nhận `constrains` tới module đã nêu; Statement cũng ràng buộc trực tiếp translation review và canonical issue state.

## Relations

Frontmatter ghi module và StateOwner bị rule ràng buộc. Reverse trace được derive; relation không nói rule sở hữu hoặc gây business impact lên target.

## Evidence

- `src/modules/Translation/application/approveTranslation.js`
- `src/modules/Cis/application/applyReviewedIssueTranslation.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
