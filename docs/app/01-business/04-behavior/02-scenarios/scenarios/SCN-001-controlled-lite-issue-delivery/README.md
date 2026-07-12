---
schema: entity-instance/v1
id: SCN-001
slug: controlled-lite-issue-delivery
title: Controlled Lite Issue Delivery
entity_type: Scenario
layer: 01-business
concern: 04-behavior
status: active
summary: Happy path Lite đưa một issue từ Backlog vào CIS, qua review/gate, rồi publish sang Jira có kiểm soát.
theory_basis:
  - TH-HUBFLOW
  - TH-SYNC-SAFE
  - TH-OPS-TRACE
relations:
  composes:
    - PROC-002
    - PROC-003
    - PROC-004
    - PROC-005
    - PROC-006
    - PROC-007
    - PROC-008
    - PROC-009
---

# SCN-001 - Controlled Lite Issue Delivery

## Summary

Happy path Lite đưa một issue từ Backlog vào CIS, qua review/gate, rồi publish sang Jira có kiểm soát.

## Meaning

Scenario mô tả end-to-end business situation tối thiểu của Lite; không phải UI journey hay architecture flow.

## Scenario Context

Một issue thuộc project đã cấu hình cần được đưa từ Backlog vào CIS, được operator review/gate, rồi mới ghi sang Jira khi đủ điều kiện.

## Composed Processes

Happy-path compose các Process khóa Slice 1 + Slice 2 và project-pull của Slice 3:

- `PROC-002` Pull Backlog Issue
- `PROC-003` Pull Backlog Project
- `PROC-004` Review Translation
- `PROC-005` Review Canonical Issue
- `PROC-006` Approve Required Mapping
- `PROC-007` Resolve Blocking Anomaly
- `PROC-008` Review Jira Dry-run
- `PROC-009` Publish Issue To Jira

## Outcomes

- Issue đủ điều kiện hoàn tất đường Backlog -> CIS -> Jira có kiểm soát.
- Issue chưa đủ điều kiện bị chặn trước external write.
- Outcome từng bước truy vết được qua journal/audit vận hành.

## Relations

- `composes` → `PROC-002`, `PROC-003`, `PROC-004`, `PROC-005`, `PROC-006`, `PROC-007`, `PROC-008`, `PROC-009`
- `PROC-010` / `PROC-011` là nhánh recovery, không thuộc happy path.


## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md` Business flow Lite.
- Product/quality: `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
