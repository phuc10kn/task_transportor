---
schema: entity-instance/v1
id: MOD-001
slug: cis
title: Cis
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Sở hữu canonical issue state và write path tương ứng.
theory_basis:
  - TH-MOD-01
  - TH-MOD-04
  - TH-MOD-06
  - TH-HUBFLOW-01
  - TH-CANON-01
  - TH-CANON-04
relations:
  owns:
    - SO-001
---

# MOD-001 - Cis

## Summary

Sở hữu canonical issue state và write path tương ứng của CIS.

## Meaning

Module lõi của kiến trúc `System -> CIS -> System`. Đây là nơi giữ canonical issue state và là điểm hội tụ của inbound từ Backlog, translation review và outbound sync result.

## Responsibility

- Sở hữu write path cho `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `issue_worklogs`.
- Expose API đọc và cập nhật canonical issue cho các module khác.
- Ghi revision, snapshot, sync status, duplicate/conflict state và kết quả apply translation review.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Cis/CisApi.js`, `src/modules/Cis/http/routes.js` |
| Owned state | canonical issue state, revision history, attachment metadata |
| Main inbound | `Backlog`, `Translation`, `Jira`, admin editor |
| Main outbound | `Dashboard`, `Translation`, `Jira` đọc snapshot |

## Rules / constraints

- Module khác không được write thẳng vào canonical issue tables.
- `Cis` không tự chứa transport detail của Backlog hoặc Jira.
- Mọi canonical edit phải đi qua `CisApi`.

## Related Entities

- [MOD-002-backlog](../../modules/MOD-002-backlog/README.md) - inbound source chính hiện tại
- [MOD-003-translation](../../modules/MOD-003-translation/README.md) - apply reviewed translation vào canonical issue
- [MOD-007-jira](../../modules/MOD-007-jira/README.md) - đọc snapshot để dry-run và sync outbound
- [MB-001-cis-canonical-ownership](../../../02-boundaries/module-boundaries/MB-001-cis-canonical-ownership/README.md) - boundary owner write chính
- [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md) - state owner tương ứng

## Relations

- `owns`: [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md).
- Các module và boundary khác trong Related Entities giữ vai trò dependency hoặc context; không có slot canonical tương ứng trong slice này.

## Evidence

- `src/modules/Cis/CisApi.js`
- `src/modules/Cis/http/routes.js`
- `docs/app/05-architecture/01-structure/README.md`
- `docs/app/05-architecture/02-boundaries/README.md`

## Validation Notes

- Ownership canonical của CIS và SO-001 được nêu trực tiếp trong responsibility, write policy và evidence.
