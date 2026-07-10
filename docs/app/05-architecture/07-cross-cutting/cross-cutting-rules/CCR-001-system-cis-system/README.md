---
schema: entity-instance/v1
id: CCR-001
slug: system-cis-system
title: System CIS System
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
summary: Toàn bộ kiến trúc hiện tại tổ chức quanh mô hình `System -> CIS -> System`.
theory_basis:
  - TH-HUBFLOW-01
  - TH-HUBFLOW-02
  - TH-HUBFLOW-03
relations:
  constrains:
    - MOD-002
    - MOD-001
    - MOD-003
    - MOD-007
    - MOD-006
---
# CCR-001 - System CIS System

## Summary

Toàn bộ kiến trúc hiện tại tổ chức quanh mô hình `System -> CIS -> System`.

## Meaning

Toàn bộ kiến trúc hiện tại tổ chức quanh mô hình `System -> CIS -> System`.

## Why this rule exists

Toàn bộ kiến trúc hiện tại tổ chức quanh mô hình `System -> CIS -> System`. Rule này giữ một invariant kiến trúc cần được review khi flow hoặc module liên quan thay đổi.

## Statement

Inbound đi vào CIS để canonicalize và review; outbound lấy dữ liệu từ CIS thay vì sync thẳng giữa external systems.

## Scope

`Backlog`, `Cis`, `Translation`, `Jira`, `Sync`

## Design consequences

Thiết kế mới hoặc thay đổi phải tuân thủ Statement và Scope; rule không tự tạo ownership hoặc relation canonical mới.

## Review questions this rule forces

Thay đổi này có bypass Statement, làm mơ hồ owner/boundary, hoặc làm mất guardrail đã nêu không?

## Anti-patterns avoided

Scope và Statement xác nhận `constrains` tới module đã nêu; chúng không tạo relation impact `affects`.

## Relations

Frontmatter ghi module bị rule ràng buộc. Reverse trace được derive; relation không nói rule sở hữu hoặc gây business impact lên module.

## Evidence

- `docs/app/05-architecture/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
