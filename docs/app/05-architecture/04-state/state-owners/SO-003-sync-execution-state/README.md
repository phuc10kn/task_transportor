---
id: SO-003
slug: sync-execution-state
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
theory_basis:
  - TH-OPS-TRACE-01
  - TH-OPS-TRACE-02
  - TH-OPS-TRACE-05
---

# SO-003 - Sync Execution State

## Meaning

State của hàng đợi job nội bộ, retry, worker progress và journal execution.

## Owner

`Sync`

## Reason

Execution state phải tập trung để worker retry và audit có thể hoạt động nhất quán, nhưng nó vẫn tách khỏi business state.

## Write policy

- `Sync` write `sync_jobs`, `sync_journal`.
- Module khác enqueue hoặc yêu cầu retry qua `SyncApi`.

## Consumers

- `Dashboard`
- `Jira`
- admin operations

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Sync/SyncApi.js`
