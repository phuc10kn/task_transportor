---
schema: entity-instance/v1
id: BRULE-001
slug: route-through-cis
title: Route Through CIS
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Mọi đường chuyển giao yêu cầu Lite giữa Backlog và Jira phải đi qua CIS, không sync thẳng hệ ngoài.
theory_basis:
  - TH-HUBFLOW
relations:
  governs:
    - PROC-002
    - PROC-003
    - PROC-009
---

# BRULE-001 - Route Through CIS

## Summary

Mọi đường chuyển giao yêu cầu Lite giữa Backlog và Jira phải đi qua CIS, không sync thẳng hệ ngoài.

## Meaning

Rule khẳng định CIS là điểm kiểm soát trung gian bắt buộc của business flow Lite.

## Statement

Outbound delivery và ingest vận hành chính của Lite phải đi qua CIS; không coi Backlog -> Jira direct sync là workflow chính.

## Condition

Khi tổ chức đưa yêu cầu từ Backlog vào vận hành và khi yêu cầu được publish sang Jira trong phạm vi Lite.

## Outcome

- Ingest và publish hợp lệ đi qua CIS.
- Direct sync Backlog -> Jira không được chấp nhận như đường vận hành chính.

## Scope

Happy-path ingest và publish Lite giữa Backlog và Jira.

## Relations

- `governs` → `PROC-002`, `PROC-003`, `PROC-009`


## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md` Business Truth và Rule Riêng.
- Product scope: `docs/app/02-product/README.md`.
