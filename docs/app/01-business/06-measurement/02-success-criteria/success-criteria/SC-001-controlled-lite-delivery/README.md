---
schema: entity-instance/v1
id: SC-001
slug: controlled-lite-delivery
title: Controlled Lite Delivery
entity_type: SuccessCriterion
layer: 01-business
concern: 06-measurement
status: active
summary: Issue đủ điều kiện đi Backlog -> CIS -> Jira có kiểm soát; issue chưa đủ điều kiện không tạo external write.
theory_basis:
  - TH-SYNC-SAFE
  - TH-OPS-TRACE
---

# SC-001 - Controlled Lite Delivery

## Summary

Issue đủ điều kiện đi Backlog -> CIS -> Jira có kiểm soát; issue chưa đủ điều kiện không tạo external write.

## Meaning

Tiêu chí thành công Lite là chuyển giao có kiểm soát và giải thích được, không phải tốc độ sync tối đa.

## Statement

Controlled Lite delivery đạt khi một issue đủ điều kiện có thể hoàn tất đường Backlog -> CIS -> Jira, còn issue chưa đủ điều kiện bị chặn trước external write và outcome được giải thích được qua journal/audit.

## Condition

- Issue thuộc project đã cấu hình và đã đi qua các gate Lite cần thiết trước publish.
- Dry-run/readiness còn hợp lệ khi yêu cầu external write.
- Issue bị block hoặc stale không tạo Jira write thật.

## Validation Method

Đối chiếu business/product/quality acceptance Lite và kết quả vận hành/journal của các lần pull, review, dry-run, publish.

## Relations

Không có outbound slot active. Success bar của Goal ghi từ `Goal --measured_by--> SuccessCriterion`.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- Product scope: `docs/app/02-product/README.md`.
