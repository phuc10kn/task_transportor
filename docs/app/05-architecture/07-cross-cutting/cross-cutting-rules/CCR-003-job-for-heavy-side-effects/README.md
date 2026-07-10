---
schema: entity-instance/v1
id: CCR-003
slug: job-for-heavy-side-effects
title: Job For Heavy Side Effects
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
summary: Những path nặng, batch hoặc cần retry nên đi qua `Sync`.
theory_basis:
  - TH-OPS-TRACE-01
  - TH-OPS-TRACE-02
relations:
  constrains:
    - MOD-002
    - MOD-003
    - MOD-006
    - MOD-007
---
# CCR-003 - Job For Heavy Side Effects

## Summary

Những path nặng, batch hoặc cần retry nên đi qua `Sync`.

## Meaning

Những path nặng, batch hoặc cần retry nên đi qua `Sync`.

## Statement

Project pull, scheduled pull, translate job và outbound push dùng execution path có hàng đợi và journal thay vì nhồi toàn bộ vào request lifecycle.

## Scope

`Backlog`, `Translation`, `Sync`, `Jira`



## Why this rule exists

Những path nặng, batch hoặc cần retry nên đi qua `Sync`. Rule này giữ một invariant kiến trúc cần được review khi flow hoặc module liên quan thay đổi.

## Design consequences

Thiết kế mới hoặc thay đổi phải tuân thủ Statement và Scope; rule không tự tạo ownership hoặc relation canonical mới.

## Review questions this rule forces

Thay đổi này có bypass Statement, làm mơ hồ owner/boundary, hoặc làm mất guardrail đã nêu không?

## Anti-patterns avoided

Scope và Statement xác nhận `constrains` tới module đã nêu; chúng không tạo relation impact `affects`.

## Relations

Frontmatter ghi module bị rule ràng buộc. Reverse trace được derive; relation không nói rule sở hữu hoặc gây business impact lên module.

## Evidence

- `src/modules/Backlog/application/pullProject.js`
- `src/modules/Translation/application/retranslateTranslation.js`
- `src/modules/Jira/application/requestJiraSync.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
