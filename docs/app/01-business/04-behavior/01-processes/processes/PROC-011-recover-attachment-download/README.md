---
schema: entity-instance/v1
id: PROC-011
slug: recover-attachment-download
title: Recover Attachment Download
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator retry riêng attachment Backlog tải lỗi mà không làm lại hoặc hủy toàn bộ issue ingest.
theory_basis:
  - TH-OPS-TRACE
  - TH-SYNC-SAFE
---

# PROC-011 - Recover Attachment Download

## Summary

Operator retry riêng attachment Backlog tải lỗi mà không làm lại hoặc hủy toàn bộ issue ingest.

## Meaning

Attachment recovery là nhánh tách biệt khỏi issue ingest. Attachment failure được hiển thị và truy vết nhưng không mặc định làm thất bại toàn bộ issue.

## Trigger

Operator chọn một attachment Backlog có trạng thái download lỗi và yêu cầu retry riêng.

## Participants

- Admin/operator.

## Steps

1. Operator xem attachment lỗi trong context của canonical issue.
2. Operator xác nhận attachment thuộc nguồn Backlog và có thể retry.
3. Operator chủ động yêu cầu tải lại attachment.
4. CIS cập nhật outcome attachment và ghi journal cho lần retry.
5. Operator xác nhận attachment đã tải hoặc tiếp tục giữ trạng thái lỗi để xử lý.

## Outcomes

- Attachment retry có outcome thành công/thất bại riêng.
- Issue ingest trước đó không bị hủy chỉ vì attachment tiếp tục lỗi.
- Recovery giữ trace tới issue, attachment và operator.

## Rules

- Chỉ attachment nguồn Backlog đủ dữ liệu mới được retry theo đường này.
- Attachment recovery không thuộc happy-path scenario.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Backlog/application/retryAttachmentDownload.js`.
- Automated evidence: `npm run verify:phase03`.
