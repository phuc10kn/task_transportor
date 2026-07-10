---
schema: entity-instance/v1
id: CCR-002
slug: owner-write-discipline
title: Owner Write Discipline
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
summary: Shared DB không làm mất owner write của module.
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
relations:
  constrains:
    - MOD-001
    - MOD-002
    - MOD-003
    - MOD-004
    - MOD-005
    - MOD-006
    - MOD-007
    - MOD-008
    - MOD-009
    - MOD-010
---
# CCR-002 - Owner Write Discipline

## Summary

Shared DB không làm mất owner write của module.

## Meaning

Shared DB không làm mất owner write của module.

## Statement

Cross-module write mặc định bị cấm. Nếu cần thay đổi dữ liệu của module khác, phải đi qua API công khai của owner.

## Scope

Toàn bộ module business trong monolith.



## Why this rule exists

Shared DB không làm mất owner write của module. Rule này giữ một invariant kiến trúc cần được review khi flow hoặc module liên quan thay đổi.

## Design consequences

Thiết kế mới hoặc thay đổi phải tuân thủ Statement và Scope; rule không tự tạo ownership hoặc relation canonical mới.

## Review questions this rule forces

Thay đổi này có bypass Statement, làm mơ hồ owner/boundary, hoặc làm mất guardrail đã nêu không?

## Anti-patterns avoided

Scope và Statement xác nhận `constrains` tới module đã nêu; chúng không tạo relation impact `affects`.

## Relations

Frontmatter ghi module bị rule ràng buộc. Reverse trace được derive; relation không nói rule sở hữu hoặc gây business impact lên module.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
