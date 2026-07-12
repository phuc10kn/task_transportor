---
schema: entity-instance/v1
id: PROC-004
slug: review-translation
title: Review Translation
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator review AI translation draft và quyết định approve, edit hoặc reject trước khi nội dung trở thành canonical.
theory_basis:
  - TH-AI-GOV
  - TH-CANON
---

# PROC-004 - Review Translation

## Summary

Operator review AI translation draft và quyết định approve, edit hoặc reject trước khi nội dung trở thành canonical.

## Meaning

Translation là trợ lý AI; human giữ authority cuối. Queue/review riêng không đồng nghĩa mọi issue bị chặn sync, nhưng issue đang `pending_translate` chưa đủ readiness outbound.

## Trigger

Có translation draft cần human review, hoặc operator mở review entry translation của issue.

## Participants

- Admin/operator.

## Steps

1. Operator mở translation draft gắn với issue trong CIS.
2. Operator đối chiếu draft với nhu cầu vận hành và ngữ cảnh issue.
3. Operator approve, chỉnh tay, hoặc reject draft.
4. CIS cập nhật trạng thái review/canonical theo quyết định của operator.
5. Operator xác nhận issue có thể tiếp tục các gate khác hoặc vẫn cần xử lý translation.

## Outcomes

- Draft đã được human quyết định (approve/edit/reject).
- Nội dung AI không tự trở thành canonical nếu chưa qua review path phù hợp.
- Issue ở state `pending_translate` vẫn chưa syncable; queue item riêng không mặc định là universal outbound gate.

## Rules

- Human giữ authority đối với translation.
- Không diễn giải “translation luôn block” hoặc “translation không bao giờ block”.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`.
- GAP-BIZ-02 wording: queue riêng vs state `pending_translate`.
- Automated evidence: `npm run verify:phase04`.
