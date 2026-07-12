---
schema: entity-instance/v1
id: PROB-001
slug: manual-cross-system-sync-risk
title: Manual Cross-System Sync Risk
entity_type: Problem
layer: 01-business
concern: 01-discovery
status: validated
summary: Đồng bộ yêu cầu thủ công giữa Backlog và Jira tạo rủi ro sai lệch, chậm trễ và khó truy vết.
theory_basis:
  - TH-HUBFLOW
relations:
  affects:
    - STK-001
---

# PROB-001 - Manual Cross-System Sync Risk

## Summary

Đồng bộ yêu cầu thủ công giữa Backlog và Jira tạo rủi ro sai lệch, chậm trễ và khó truy vết.

## Meaning

Business pain nằm ở việc chuyển giao yêu cầu giữa hai hệ thống vận hành khác nhau mà không có điểm kiểm soát trung gian ổn định.

## Statement

Khi yêu cầu được đồng bộ thủ công giữa Backlog và Jira, tổ chức chịu rủi ro mất consistency, chậm phản hồi và khó giải thích outcome của từng lần chuyển giao.

## Affected Stakeholders

- Admin/operator chịu trách nhiệm kéo dữ liệu, review và publish.
- Đội nhận yêu cầu trên Backlog chịu ảnh hưởng khi trạng thái nguồn không được phản ánh đúng.
- Đội delivery trên Jira chịu ảnh hưởng khi nhận công việc thiếu kiểm soát hoặc thiếu ngữ cảnh.

## Current Impact

- Chi phí vận hành tăng vì phải đối chiếu thủ công.
- Rủi ro publish sai hoặc thiếu gate trước khi ghi hệ ngoài.
- Khó audit vì thiếu journal/outcome thống nhất cho từng bước chuyển giao.

## Relations

- `affects` → `STK-001`
- `STK-002` / `STK-003` không materialize (accepted gap Plan 05).


## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`.
- Corroborating product/quality: `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
