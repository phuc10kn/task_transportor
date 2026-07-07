---
id: MB-005
slug: sync-executes-not-owns
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-05
---

# MB-005 - Sync Executes Not Owns

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

- [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md) - execution owner
- [SO-003-sync-execution-state](../../../04-state/state-owners/SO-003-sync-execution-state/README.md) - state do Sync sở hữu

## Evidence

- `src/modules/Sync/SyncApi.js`
- `src/modules/Sync/application/handlerRegistry.js`
