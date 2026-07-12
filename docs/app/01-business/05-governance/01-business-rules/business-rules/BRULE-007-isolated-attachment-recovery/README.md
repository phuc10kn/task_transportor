---
schema: entity-instance/v1
id: BRULE-007
slug: isolated-attachment-recovery
title: Isolated Attachment Recovery
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Attachment download failure có recovery riêng và không mặc định làm thất bại toàn bộ issue ingest.
theory_basis:
  - TH-OPS-TRACE
  - TH-SYNC-SAFE
relations:
  governs:
    - PROC-002
    - PROC-003
    - PROC-011
---

# BRULE-007 - Isolated Attachment Recovery

## Summary

Attachment download failure có recovery riêng và không mặc định làm thất bại toàn bộ issue ingest.

## Meaning

Rule tách outcome attachment khỏi outcome ingest issue, đồng thời giữ recovery và journal riêng cho attachment lỗi.

## Statement

Khi attachment tải lỗi, CIS giữ issue ingest và canonical review entry nếu phần issue đã hợp lệ; operator xử lý attachment qua recovery riêng.

## Condition

Khi manual issue pull hoặc project pull gặp attachment Backlog tải thất bại.

## Outcome

- Issue ingest không bị hủy chỉ vì attachment download failure.
- Attachment lỗi có trạng thái và retry path riêng.
- Retry attachment có journal/outcome độc lập.

## Scope

Backlog attachment ingest và recovery trong Lite; không mô tả upload/sync attachment sang Jira.

## Relations

- `governs` → `PROC-002`, `PROC-003`, `PROC-011`

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Backlog/application/downloadAttachmentToCis.js`, `src/modules/Backlog/application/retryAttachmentDownload.js`.
