---
schema: entity-instance/v1
id: MB-001
slug: cis-canonical-ownership
title: Cis Canonical Ownership
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
summary: Boundary này chốt `Cis` là owner write của canonical issue state trong hệ thống.
theory_basis:
  - TH-CANON-01
  - TH-CANON-04
relations:
  constrains:
    - MOD-001
  constrains_state_owner:
    - SO-001
---
# MB-001 - Cis Canonical Ownership

## Summary

Boundary này chốt `Cis` là owner write của canonical issue state trong hệ thống.

## Meaning

Boundary này chốt `Cis` là owner write của canonical issue state trong hệ thống.

## Why this boundary matters

Boundary này chốt `Cis` là owner write của canonical issue state trong hệ thống. Boundary này giữ owner, access hoặc write discipline không bị mơ hồ khi code thay đổi.

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

Module chịu boundary này phải giữ public API, owner-write discipline và các read/write exception đã được nêu trong Statement.

## Related Entities

- Canonical relation: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md) - owner write
- Canonical relation: [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md) - state được bảo vệ
- Context/evidence: [CCR-002-owner-write-discipline](../../../07-cross-cutting/cross-cutting-rules/CCR-002-owner-write-discipline/README.md) - rule cắt ngang củng cố boundary này


## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Cis/CisApi.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
