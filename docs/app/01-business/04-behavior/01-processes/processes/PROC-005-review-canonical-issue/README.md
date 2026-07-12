---
schema: entity-instance/v1
id: PROC-005
slug: review-canonical-issue
title: Review Canonical Issue
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator xem và chỉnh canonical issue trong CIS trước khi tiếp tục các gate outbound.
theory_basis:
  - TH-CANON
  - TH-OPS-TRACE
---

# PROC-005 - Review Canonical Issue

## Summary

Operator xem và chỉnh canonical issue trong CIS trước khi tiếp tục các gate outbound.

## Meaning

Process giữ canonical review entry là điểm kiểm soát nội dung trước dry-run/publish; không phải bước sync thẳng sang Jira.

## Trigger

Operator mở canonical issue đã được ingest vào CIS để review hoặc chỉnh sửa.

## Participants

- Admin/operator.

## Steps

1. Operator mở review entry của issue trong CIS.
2. Operator đối chiếu nội dung canonical với nhu cầu vận hành hiện tại.
3. Operator chỉnh sửa canonical khi cần trước outbound.
4. CIS phản ánh thay đổi canonical và đánh dấu preview cũ không còn hợp lệ nếu dữ liệu đổi.
5. Operator quyết định giữ issue để tiếp tục gate tiếp theo hoặc giữ lại để xử lý thêm.

## Outcomes

- Canonical issue phản ánh trạng thái đã được operator review.
- Thay đổi canonical làm stale preview/dry-run cũ.
- Issue sẵn sàng đi tiếp các gate mapping/anomaly/dry-run khi đủ điều kiện; chưa có external write.

## Rules

- Canonical edit thuộc quyền quyết định của operator.
- Preview/dry-run cũ không được dùng sau khi canonical đổi.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md` (issue preparation / canonical edit).
- Product/quality: `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: CIS Issue Editor / issue-editor surface trong Lite.
