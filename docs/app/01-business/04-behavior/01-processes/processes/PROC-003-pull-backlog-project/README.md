---
schema: entity-instance/v1
id: PROC-003
slug: pull-backlog-project
title: Pull Backlog Project
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Project batch pull được giữ làm business trace nhưng hiện bị disable.
theory_basis:
  - TH-HUBFLOW
  - TH-OPS-TRACE
---

# PROC-003 - Pull Backlog Project

## Summary

Project batch pull được giữ làm business trace nhưng hiện bị disable.

## Meaning

Project pull không phải đường ingest active; operator dùng Pull one hoặc sync từng candidate.

## Trigger

Không có trigger active trong Lite hiện tại.

## Participants

- Admin/operator.

## Steps

1. UI hiển thị Pull project ở trạng thái disabled.
2. API manual từ chối request bằng lỗi có chủ ý.
3. Operator dùng candidate browser và sync từng issue.

## Outcomes

- Không query Backlog hoặc enqueue batch job.
- Candidate action riêng vẫn đi qua `Backlog -> CIS`.

## Rules

- Chỉ được bật lại sau khi có thiết kế queue-only được review.
- Scheduled pull cũng bị disable trong scope hiện tại.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Backlog/application/pullProject.js`.
- Automated evidence: `npm run verify:phase03`.
