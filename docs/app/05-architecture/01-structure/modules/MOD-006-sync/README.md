---
id: MOD-006
slug: sync
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-05
  - TH-OPS-TRACE-01
  - TH-OPS-TRACE-02
  - TH-OPS-TRACE-05
---

# MOD-006 - Sync

## Meaning

Module thực thi job nội bộ cho các side effect nặng hoặc cần retry. Nó là execution backbone của monolith nhưng không phải owner business state chính.

## Responsibility

- Enqueue, run, retry, cancel sync jobs.
- Chạy worker và registry handler.
- Ghi `sync_journal`.
- Recover stale jobs.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Sync/SyncApi.js`, `src/modules/Sync/http/routes.js` |
| Owned state | `sync_jobs`, `sync_journal` |
| Registered handlers | `manual_pull`, `translate`, `push_issue`, `push_comment` |
| Runtime role | internal worker orchestration |

## Rules / constraints

- `Sync` thực thi use case được module khác định nghĩa, không cướp ownership của business state.
- Không chứa canonical policy riêng cho Backlog, Translation hoặc Jira.
- Journal phải ghi được outcome của job path quan trọng.

## Related Entities

- [MOD-002-backlog](../../modules/MOD-002-backlog/README.md) - enqueue manual pull jobs
- [MOD-003-translation](../../modules/MOD-003-translation/README.md) - enqueue translate jobs
- [MOD-007-jira](../../modules/MOD-007-jira/README.md) - enqueue outbound push jobs
- [MB-005-sync-executes-not-owns](../../../02-boundaries/module-boundaries/MB-005-sync-executes-not-owns/README.md) - boundary quan trọng nhất
- [SO-003-sync-execution-state](../../../04-state/state-owners/SO-003-sync-execution-state/README.md) - state owner tương ứng

## Evidence

- `src/modules/Sync/SyncApi.js`
- `src/modules/Sync/application/handlerRegistry.js`
- `src/modules/Sync/application/createWorker.js`
