---
schema: entity-instance/v1
id: CCR-006
slug: shared-infrastructure-not-shared-ownership
title: Shared Infrastructure Not Shared Ownership
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
summary: Repo dùng chung Express app, SQLite, local storage và một số infrastructure adapter, nhưng ownership nghiệp vụ vẫn nằm theo module.
theory_basis:
  - TH-MOD-05
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
# CCR-006 - Shared Infrastructure Not Shared Ownership

## Summary

Repo dùng chung Express app, SQLite, local storage và một số infrastructure adapter, nhưng ownership nghiệp vụ vẫn nằm theo module.

## Meaning

Repo dùng chung Express app, SQLite, local storage và một số infrastructure adapter, nhưng ownership nghiệp vụ vẫn nằm theo module.

## Statement

Chia sẻ runtime hoặc persistence là quyết định kỹ thuật; nó không cho phép bỏ qua boundary owner-write hoặc nhúng logic domain sang module khác.

## Scope

Toàn bộ monolith, đặc biệt `Cis`, `Translation`, `Sync`, `Jira`



## Why this rule exists

Repo dùng chung Express app, SQLite, local storage và một số infrastructure adapter, nhưng ownership nghiệp vụ vẫn nằm theo module. Rule này giữ một invariant kiến trúc cần được review khi flow hoặc module liên quan thay đổi.

## Design consequences

Thiết kế mới hoặc thay đổi phải tuân thủ Statement và Scope; rule không tự tạo ownership hoặc relation canonical mới.

## Review questions this rule forces

Thay đổi này có bypass Statement, làm mơ hồ owner/boundary, hoặc làm mất guardrail đã nêu không?

## Anti-patterns avoided

Scope và Statement xác nhận `constrains` tới module đã nêu; chúng không tạo relation impact `affects`.

## Relations

Frontmatter ghi module bị rule ràng buộc. Reverse trace được derive; relation không nói rule sở hữu hoặc gây business impact lên module.

## Evidence

- `src/app.js`
- `src/server.js`
- `docs/app/05-architecture/01-structure/README.md`
- `docs/app/05-architecture/02-boundaries/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
