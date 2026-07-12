---
schema: entity-instance/v1
id: BRULE-002
slug: human-translation-authority
title: Human Translation Authority
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: AI translation draft không trở thành canonical content nếu chưa qua human approve/edit/reject.
theory_basis:
  - TH-AI-GOV
relations:
  governs:
    - PROC-004
---

# BRULE-002 - Human Translation Authority

## Summary

AI translation draft không trở thành canonical content nếu chưa qua human approve/edit/reject.

## Meaning

Human giữ authority translation; AI chỉ propose.

## Statement

Translation draft của AI chỉ được dùng làm canonical sau khi operator approve hoặc edit theo review path; reject giữ draft khỏi canonical.

## Condition

Khi có AI translation draft gắn với issue cần review trong Lite.

## Outcome

- Approve/edit: nội dung đi theo quyết định human.
- Reject: draft không trở thành canonical.
- Queue review riêng không mặc định chặn mọi canonical sync; state `pending_translate` vẫn chưa syncable.

## Scope

Translation review Lite trong CIS.

## Relations

- `governs` → `PROC-004`

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`.
- GAP-BIZ-02 wording áp dụng.
