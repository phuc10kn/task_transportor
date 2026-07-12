---
schema: entity-instance/v1
id: PROC-010
slug: recover-failed-job
title: Recover Failed Job
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator retry một sync job đã failed sau khi hiểu nguyên nhân và quyết định recovery có chủ đích.
theory_basis:
  - TH-OPS-TRACE
---

# PROC-010 - Recover Failed Job

## Summary

Operator retry một sync job đã failed sau khi hiểu nguyên nhân và quyết định recovery có chủ đích.

## Meaning

Failed-job retry là nhánh recovery, không phải bước mặc định của happy path và không phải retry mù.

## Trigger

Operator chọn một sync job ở trạng thái failed sau khi xem nguyên nhân và context vận hành.

## Participants

- Admin/operator.

## Steps

1. Operator xem failed job và thông tin giải thích failure.
2. Operator xác nhận nguyên nhân đã được hiểu hoặc điều kiện retry đã phù hợp.
3. Operator chủ động yêu cầu retry.
4. CIS đưa job failed trở lại đường xử lý hợp lệ.
5. Operator theo dõi outcome retry qua job/journal.

## Outcomes

- Chỉ failed job đủ điều kiện mới được retry.
- Retry giữ trace tới operation trước và người thực hiện.
- Job không retryable bị từ chối thay vì tạo recovery giả.

## Rules

- Retry chỉ xảy ra sau failed operation và quyết định chủ động của operator.
- Recovery không được nhập vào happy-path scenario.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Sync/application/retryJob.js`.
- Automated evidence: `npm run verify:phase02`.
