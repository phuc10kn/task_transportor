---
schema: entity-instance/v1
id: PROC-002
slug: pull-backlog-issue
title: Pull Backlog Issue
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator đưa snapshot hiện tại của một issue Backlog vào CIS để review và xử lý tiếp.
theory_basis:
  - TH-HUBFLOW
  - TH-OPS-TRACE
---

# PROC-002 - Pull Backlog Issue

## Summary

Operator chọn một issue thuộc project đã cấu hình và yêu cầu CIS thu nhận trạng thái hiện tại của issue đó.

## Meaning

Process này tạo điểm vào có kiểm soát từ Backlog sang CIS. Nó không publish sang Jira.

## Trigger

Operator chủ động chọn thao tác pull/resync một issue Backlog.

## Participants

- Admin/operator.
- Customer request team là bên duy trì yêu cầu nguồn; participation canonical chỉ ghi sau khi reviewer xác nhận.

## Steps

1. Operator chọn project và issue nguồn cần thu nhận.
2. CIS xác nhận issue thuộc project được cấu hình cho nguồn đó.
3. CIS thu nhận issue, comment và metadata attachment hiện tại.
4. CIS cập nhật source snapshot và canonical review entry.
5. CIS ghi outcome để operator có thể phân biệt ingest mới, update hoặc snapshot không đổi.

## Outcomes

- Issue có review entry trong CIS.
- Snapshot thay đổi tạo revision mới; snapshot không đổi không tạo duplicate revision.
- Attachment download failure được ghi riêng và có recovery path; issue ingest không bị hủy chỉ vì lỗi download đó.
- Không có external write sang Jira trong process này.

## Rules

- Flow phải đi qua CIS.
- Routing mismatch phải dừng ingest.
- Attachment failure được tách khỏi kết quả ingest issue.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Backlog/application/handleManualPullJob.js`, `src/modules/Backlog/application/downloadAttachmentToCis.js`.
- Automated evidence: `npm run verify:phase03`.
