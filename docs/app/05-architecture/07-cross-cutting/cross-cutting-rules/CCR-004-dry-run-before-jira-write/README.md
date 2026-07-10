---
schema: entity-instance/v1
id: CCR-004
slug: dry-run-before-jira-write
title: Dry Run Before Jira Write
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
summary: Outbound sang Jira cần preview/readiness trước khi ghi thật.
theory_basis:
  - TH-SYNC-SAFE-02
  - TH-SYNC-SAFE-03
relations:
  constrains:
    - MOD-007
    - MOD-004
    - MOD-005
    - MOD-001
    - MOD-006
---
# CCR-004 - Dry Run Before Jira Write

## Summary

Outbound sang Jira cần preview/readiness trước khi ghi thật.

## Meaning

Outbound sang Jira cần preview/readiness trước khi ghi thật.

## Statement

Dry-run không chỉ là tiện ích UI; nó là guardrail kiến trúc cho payload build, mapping completeness và anomaly checks.

## Scope

`Jira`, `Mapping`, `Anomaly`, `Cis`, `Sync`



## Why this rule exists

Outbound sang Jira cần preview/readiness trước khi ghi thật. Rule này giữ một invariant kiến trúc cần được review khi flow hoặc module liên quan thay đổi.

## Design consequences

Thiết kế mới hoặc thay đổi phải tuân thủ Statement và Scope; rule không tự tạo ownership hoặc relation canonical mới.

## Review questions this rule forces

Thay đổi này có bypass Statement, làm mơ hồ owner/boundary, hoặc làm mất guardrail đã nêu không?

## Anti-patterns avoided

Scope và Statement xác nhận `constrains` tới module đã nêu; chúng không tạo relation impact `affects`.

## Relations

Frontmatter ghi module bị rule ràng buộc. Reverse trace được derive; relation không nói rule sở hữu hoặc gây business impact lên module.

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-006-jira-dry-run/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
