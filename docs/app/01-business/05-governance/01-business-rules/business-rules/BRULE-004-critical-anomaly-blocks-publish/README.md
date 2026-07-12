---
schema: entity-instance/v1
id: BRULE-004
slug: critical-anomaly-blocks-publish
title: Critical Anomaly Blocks Publish
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Critical anomaly ở trạng thái open hoặc investigating phải được xử lý trước publish; không phải mọi open anomaly đều block.
theory_basis:
  - TH-SYNC-SAFE
  - TH-OPS-TRACE
relations:
  governs:
    - PROC-007
    - PROC-008
    - PROC-009
---

# BRULE-004 - Critical Anomaly Blocks Publish

## Summary

Critical anomaly ở trạng thái open hoặc investigating phải được xử lý trước publish; không phải mọi open anomaly đều block.

## Meaning

Outbound anomaly gate Lite khớp điều kiện severity=critical và status open/investigating.

## Statement

Issue có critical anomaly `open` hoặc `investigating` thì không được publish sang Jira cho đến khi operator xử lý gate đó.

## Condition

Khi operator yêu cầu dry-run/publish và issue còn critical anomaly blocking.

## Outcome

- Có critical anomaly open/investigating: chặn publish.
- Không suy diễn mọi open anomaly đều tạo block publish.
- Mapping required thiếu thuộc BRULE-003, không thuộc rule này.

## Scope

Outbound Lite dry-run/publish và anomaly handling.

## Relations

- `governs` → `PROC-007`, `PROC-008`, `PROC-009`

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- GAP-BIZ-01 preflight: code gate = critical + open/investigating; instance dùng wording này.
