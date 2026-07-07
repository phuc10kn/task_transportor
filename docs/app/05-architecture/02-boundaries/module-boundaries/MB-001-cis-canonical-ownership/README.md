---
id: MB-001
slug: cis-canonical-ownership
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
theory_basis:
  - TH-CANON-01
  - TH-CANON-04
---

# MB-001 - Cis Canonical Ownership

## Meaning

Boundary này chốt `Cis` là owner write của canonical issue state trong hệ thống.

## Why this boundary matters

Đây là boundary giữ cho mô hình `System -> CIS -> System` không bị sụp. Nếu module khác có thể write thẳng canonical issue state, `Cis` sẽ mất vai trò core owner và toàn kiến trúc quay về shared-database shared-ownership.

## Statement

Mọi thay đổi lên `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `issue_worklogs` phải đi qua `Cis`.

## Protected assets

- canonical issue state
- revision history
- issue sync flags và attachment metadata
- quyền tiến hóa của canonical model mà không bị adapter modules giữ hostage

## Allowed / forbidden

- Được phép: `Backlog`, `Translation`, `Jira` gọi `CisApi`.
- Bị cấm: module khác update trực tiếp canonical issue tables như owner riêng.
- Bị cấm: dùng lý do “cùng SQLite” để bỏ qua owner API.

## Typical violations this boundary prevents

- `Backlog` upsert trực tiếp vào issue tables sau khi fetch.
- `Translation` tự apply reviewed text vào issue state mà không qua `Cis`.
- `Jira` tự ghi sync status hoặc conflict flag vào canonical issue state.

## Architectural consequences

- `Cis` trở thành nơi duy nhất có quyền đổi canonical branch.
- Revision, sync status và manual edit có thể được quản trị nhất quán.
- Các module integration chỉ còn là consumer hoặc orchestrator qua owner API.

## Related Entities

- [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md) - owner write
- [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md) - state được bảo vệ
- [CCR-002-owner-write-discipline](../../../07-cross-cutting/cross-cutting-rules/CCR-002-owner-write-discipline/README.md) - rule cắt ngang củng cố boundary này

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Cis/CisApi.js`
