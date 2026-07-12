---
schema: entity-instance/v1
id: PROC-007
slug: resolve-blocking-anomaly
title: Resolve Blocking Anomaly
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator xử lý critical anomaly đang open/investigating trước khi issue được coi là sẵn sàng publish.
theory_basis:
  - TH-OPS-TRACE
  - TH-SYNC-SAFE
---

# PROC-007 - Resolve Blocking Anomaly

## Summary

Operator xử lý critical anomaly đang open/investigating trước khi issue được coi là sẵn sàng publish.

## Meaning

Blocking anomaly Lite là critical anomaly ở trạng thái open hoặc investigating. Không phải mọi open anomaly đều block publish.

## Trigger

Issue có critical anomaly `open` hoặc `investigating` cần quyết định resolve/ignore/keep open trước outbound.

## Participants

- Admin/operator.

## Steps

1. Operator xem anomaly critical đang chặn outbound.
2. Operator xác nhận nguyên nhân và phạm vi ảnh hưởng.
3. Operator resolve, ignore có chủ đích, hoặc giữ open để xử lý tiếp.
4. CIS ghi outcome anomaly để audit.
5. Operator xác nhận gate anomaly còn block hay đã đủ để đi dry-run/publish.

## Outcomes

- Critical blocking anomaly được xử lý hoặc được giữ lại có chủ đích.
- Không suy diễn mọi open anomaly đều tạo `ANOMALY_BLOCKED`.

## Rules

- Critical anomaly open/investigating phải được xử lý trước publish.
- Mapping gap không thuộc process này.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- GAP-BIZ-01: severity=critical AND status IN (open, investigating).
- Automated evidence: `npm run verify:phase05`.
