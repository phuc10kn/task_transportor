---
schema: entity-instance/v1
id: PROC-008
slug: review-jira-dry-run
title: Review Jira Dry-run
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator chạy và đánh giá dry-run/readiness trước khi yêu cầu ghi Jira thật.
theory_basis:
  - TH-SYNC-SAFE
  - TH-OPS-TRACE
---

# PROC-008 - Review Jira Dry-run

## Summary

Operator chạy và đánh giá dry-run/readiness trước khi yêu cầu ghi Jira thật.

## Meaning

Dry-run là gate kiểm soát outbound; pass dry-run chưa đồng nghĩa đã publish.

## Trigger

Operator yêu cầu xem trước payload/readiness sync sang Jira cho một issue đủ điều kiện review.

## Participants

- Admin/operator.

## Steps

1. Operator chọn issue cần đánh giá outbound readiness.
2. CIS kiểm tra các điều kiện chặn trước dry-run còn hiệu lực.
3. CIS tạo preview/dry-run dựa trên canonical data hiện tại.
4. Operator đọc kết quả readiness và lý do block nếu có.
5. Operator quyết định giữ lại, sửa canonical/mapping, hoặc chuyển sang publish khi đủ điều kiện.

## Outcomes

- Có kết quả dry-run/readiness giải thích được cho issue.
- Issue blocked hoặc stale không được coi là sẵn sàng publish.
- Không có external write sang Jira trong process này.

## Rules

- Dry-run phải dựa trên canonical data hiện tại.
- Kết quả blocked/stale phải ngăn publish cho đến khi được xử lý.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Jira/application/runJiraDryRun.js` (hoặc đường dry-run Lite tương đương).
- Automated evidence: `npm run verify:phase05`.
