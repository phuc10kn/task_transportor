---
schema: entity-instance/v1
id: BRULE-006
slug: intentional-failed-job-retry
title: Intentional Failed Job Retry
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Chỉ failed job mới được operator retry sau khi hiểu nguyên nhân; retry là recovery có chủ đích.
theory_basis:
  - TH-OPS-TRACE
relations:
  governs:
    - PROC-010
---

# BRULE-006 - Intentional Failed Job Retry

## Summary

Chỉ failed job mới được operator retry sau khi hiểu nguyên nhân; retry là recovery có chủ đích.

## Meaning

Rule ngăn retry mù và giữ operator chịu trách nhiệm cho quyết định recovery.

## Statement

Một sync job chỉ được retry khi đã failed và operator chủ động yêu cầu sau khi xem nguyên nhân vận hành.

## Condition

Khi operator xử lý một job lỗi cần recovery trong Lite.

## Outcome

- Failed job đủ điều kiện có thể quay lại đường xử lý.
- Job không failed hoặc không retryable bị từ chối.
- Retry outcome được ghi để audit và giải thích.

## Scope

Failed sync job recovery do admin/operator thực hiện.

## Relations

- `governs` → `PROC-010`

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Sync/application/retryJob.js`.
