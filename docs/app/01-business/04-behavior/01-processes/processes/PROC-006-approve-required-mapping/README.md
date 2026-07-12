---
schema: entity-instance/v1
id: PROC-006
slug: approve-required-mapping
title: Approve Required Mapping
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator approve, edit hoặc hold mapping bắt buộc trước khi issue đủ điều kiện outbound.
theory_basis:
  - TH-CANON
  - TH-SYNC-SAFE
---

# PROC-006 - Approve Required Mapping

## Summary

Operator approve, edit hoặc hold mapping bắt buộc trước khi issue đủ điều kiện outbound.

## Meaning

Required mapping là gate riêng (`MAPPING_REQUIRED`), tách khỏi critical anomaly block.

## Trigger

Issue thiếu hoặc chưa approved mapping required cho field/status/user/project liên quan outbound.

## Participants

- Admin/operator.

## Steps

1. Operator xem mapping thiếu hoặc chưa approved trên issue.
2. Operator approve, chỉnh, hoặc hold mapping theo nhu cầu vận hành.
3. CIS ghi nhận trạng thái mapping sau quyết định.
4. Operator xác nhận gate mapping không còn chặn trước dry-run/publish.

## Outcomes

- Required mapping được approved hoặc được giữ lại có chủ đích.
- Mapping gap không bị gộp vào anomaly critical block.

## Rules

- Required mapping phải approved trước publish.
- Mapping gate tách khỏi critical anomaly gate.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
- GAP-BIZ-01: mapping block riêng qua `MAPPING_REQUIRED`.
- Automated evidence: `npm run verify:phase05`.
