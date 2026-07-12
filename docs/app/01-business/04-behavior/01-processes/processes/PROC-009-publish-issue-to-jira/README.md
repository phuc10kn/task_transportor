---
schema: entity-instance/v1
id: PROC-009
slug: publish-issue-to-jira
title: Publish Issue To Jira
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator yêu cầu CIS ghi issue đã đủ điều kiện sang Jira sau khi gate outbound pass.
theory_basis:
  - TH-HUBFLOW
  - TH-SYNC-SAFE
  - TH-OPS-TRACE
---

# PROC-009 - Publish Issue To Jira

## Summary

Operator yêu cầu CIS ghi issue đã đủ điều kiện sang Jira sau khi gate outbound pass.

## Meaning

Đây là bước external write có kiểm soát từ CIS sang Jira; không phải sync thẳng Backlog -> Jira.

## Trigger

Operator chủ động yêu cầu publish sau khi dry-run/readiness còn hợp lệ.

## Participants

- Admin/operator.
- Đội delivery trên Jira là bên nhận outcome; participation canonical chỉ ghi sau khi reviewer xác nhận.

## Steps

1. Operator chọn issue đã qua các gate Lite cần thiết.
2. CIS xác nhận dry-run/readiness còn fresh và không bị block.
3. CIS thực hiện ghi issue sang Jira theo quyết định publish của operator.
4. CIS ghi outcome thành công hoặc thất bại để audit/recovery.
5. Operator dùng outcome để xác nhận hoàn tất hoặc chuyển sang recovery có chủ đích.

## Outcomes

- Issue đủ điều kiện được ghi sang Jira qua CIS.
- Issue blocked/stale bị từ chối trước external write.
- Outcome publish được ghi nhận để truy vết và recovery.

## Rules

- Mọi outbound delivery phải đi qua CIS.
- Publish chỉ được khi dry-run/readiness còn hợp lệ.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Jira/application/requestJiraSync.js` (hoặc push handler Lite tương đương).
- Automated evidence: `npm run verify:phase06`.
