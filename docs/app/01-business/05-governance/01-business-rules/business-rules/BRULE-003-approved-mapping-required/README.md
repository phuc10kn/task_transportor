---
schema: entity-instance/v1
id: BRULE-003
slug: approved-mapping-required
title: Approved Mapping Required
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Required mapping phải được approve trước dry-run/publish; đây là gate riêng khỏi critical anomaly.
theory_basis:
  - TH-SYNC-SAFE
  - TH-CANON
relations:
  governs:
    - PROC-006
    - PROC-008
    - PROC-009
---

# BRULE-003 - Approved Mapping Required

## Summary

Required mapping phải được approve trước dry-run/publish; đây là gate riêng khỏi critical anomaly.

## Meaning

Mapping required thiếu/chưa approved tạo block `MAPPING_REQUIRED`, không gộp vào anomaly critical.

## Statement

Issue có required mapping chưa approved thì không được publish sang Jira; operator phải approve/edit/hold trước outbound.

## Condition

Khi issue cần mapping bắt buộc cho outbound Lite và operator chuẩn bị dry-run/publish.

## Outcome

- Mapping approved: gate mapping không chặn.
- Mapping thiếu/chưa approved: chặn bằng mapping gate riêng.

## Scope

Outbound Lite qua dry-run và publish.

## Relations

- `governs` → `PROC-006`, `PROC-008`, `PROC-009`

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`.
- GAP-BIZ-01: tách mapping khỏi anomaly.
