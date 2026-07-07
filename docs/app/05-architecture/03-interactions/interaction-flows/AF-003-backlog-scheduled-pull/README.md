---
id: AF-003
slug: backlog-scheduled-pull
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
theory_basis:
  - TH-HUBFLOW-02
  - TH-OPS-TRACE-02
---

# AF-003 - Backlog Scheduled Pull

## Meaning

Luồng quét scheduled pull nội bộ để tạo job inbound cho các project đã enable.

## Trigger

Internal scheduler hoặc worker process gọi scheduled pull scan.

## Path

`internal scheduler -> BacklogApi.runScheduledPullScan(...) -> load enabled projects -> query source list -> SyncApi.enqueueJob(manual_pull x N)`

## Outcome

Tạo job backlog pull định kỳ theo project mà không cần request thủ công từ admin.

## Related Entities

- [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md)
- [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- [SO-004-project-integration-state](../../../04-state/state-owners/SO-004-project-integration-state/README.md)

## Evidence

- `src/modules/Backlog/application/runScheduledPullScan.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-003-backlog-scheduled-pull/README.md`
