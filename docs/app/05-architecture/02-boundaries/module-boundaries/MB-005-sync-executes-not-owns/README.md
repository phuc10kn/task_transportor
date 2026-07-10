---
schema: entity-instance/v1
id: MB-005
slug: sync-executes-not-owns
title: Sync Executes Not Owns
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
summary: Boundary này giữ cho `Sync` là execution module, không trở thành business owner thay cho `Backlog`, `Translation` hoặc `Jira`.
theory_basis:
  - TH-MOD-01
  - TH-MOD-05
relations:
  constrains:
    - MOD-006
  constrains_state_owner:
    - SO-003
---
# MB-005 - Sync Executes Not Owns

## Summary

Boundary này giữ cho `Sync` là execution module, không trở thành business owner thay cho `Backlog`, `Translation` hoặc `Jira`.

## Meaning

Boundary này giữ cho `Sync` là execution module, không trở thành business owner thay cho `Backlog`, `Translation` hoặc `Jira`.

## Statement

`Sync` được quyền quản lý job lifecycle và journal, nhưng handler logic vẫn phải phản chiếu use case của owner module tương ứng.

## Protected assets

- business ownership của module domain
- khả năng retry mà không trộn business policy vào worker core
- tính rõ ràng giữa execution state và domain state

## Allowed / forbidden

- Được phép: enqueue, retry, cancel, recover stale jobs, run handlers đã đăng ký.
- Bị cấm: tự sinh policy canonical riêng cho inbound, translation hoặc outbound sync.

## Related Entities

- Canonical relation: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md) - execution owner
- Canonical relation: [SO-003-sync-execution-state](../../../04-state/state-owners/SO-003-sync-execution-state/README.md) - state do Sync sở hữu



## Why this boundary matters

Boundary này giữ cho `Sync` là execution module, không trở thành business owner thay cho `Backlog`, `Translation` hoặc `Jira`. Boundary này giữ owner, access hoặc write discipline không bị mơ hồ khi code thay đổi.

## Architectural consequences

Module chịu boundary này phải giữ public API, owner-write discipline và các read/write exception đã được nêu trong Statement.

## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Sync/SyncApi.js`
- `src/modules/Sync/application/handlerRegistry.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
