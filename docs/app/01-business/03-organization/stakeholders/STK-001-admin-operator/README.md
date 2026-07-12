---
schema: entity-instance/v1
id: STK-001
slug: admin-operator
title: Admin Operator
entity_type: Stakeholder
layer: 01-business
concern: 03-organization
status: active
summary: Admin/operator kéo dữ liệu, review, approve, resolve, publish và recovery trong CIS.
theory_basis:
  - TH-OPS-TRACE
  - TH-AI-GOV
relations:
  participates_in:
    - PROC-002
    - PROC-003
    - PROC-004
    - PROC-005
    - PROC-006
    - PROC-007
    - PROC-008
    - PROC-009
    - PROC-010
    - PROC-011
---

# STK-001 - Admin Operator

## Summary

Admin/operator kéo dữ liệu, review, approve, resolve, publish và recovery trong CIS.

## Meaning

Đây là stakeholder vận hành chính giữ authority quyết định trong Lite; không phải scheduler, worker hay AI transport.

## Stakeholder Type

Internal operator / admin vận hành sync hub.

## Interests

- Có đủ thông tin để quyết định pull, review, approve, publish hoặc giữ lại.
- Giảm rủi ro external write sai.
- Có audit/journal để giải thích outcome sau thao tác.

## Responsibilities

- Pull issue/project từ Backlog khi cần.
- Review translation và canonical issue.
- Approve mapping required và xử lý blocking anomaly.
- Chạy dry-run và publish sang Jira khi đủ điều kiện.
- Thực hiện recovery có chủ đích cho failed job/attachment.

## Relations

- `participates_in` → `PROC-002`, `PROC-003`, `PROC-004`, `PROC-005`, `PROC-006`, `PROC-007`, `PROC-008`, `PROC-009`, `PROC-010`, `PROC-011`


## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md` phần stakeholder và workflow Lite.
