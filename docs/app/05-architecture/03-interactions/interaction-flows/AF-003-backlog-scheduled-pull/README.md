---
schema: entity-instance/v1
id: AF-003
slug: backlog-scheduled-pull
title: Backlog Scheduled Pull
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Luồng quét scheduled pull nội bộ để tạo job inbound cho các project đã enable.
theory_basis:
  - TH-HUBFLOW-02
  - TH-OPS-TRACE-02
relations:
  involves:
    - MOD-002
    - MOD-008
    - MOD-006
  changes:
    - SO-003
---
# AF-003 - Backlog Scheduled Pull

## Summary

Luồng quét scheduled pull nội bộ để tạo job inbound cho các project đã enable.

## Meaning

Luồng quét scheduled pull nội bộ để tạo job inbound cho các project đã enable.

## Trigger

Internal scheduler hoặc worker process gọi scheduled pull scan.

## Path

`internal scheduler -> BacklogApi.runScheduledPullScan(...) -> load enabled projects -> query source list -> SyncApi.enqueueJob(manual_pull x N)`

## Outcome

Tạo job backlog pull định kỳ theo project mà không cần request thủ công từ admin.

## Related Entities

- Canonical relation: [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md)
- Canonical relation: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- Context/evidence: [SO-004-project-integration-state](../../../04-state/state-owners/SO-004-project-integration-state/README.md)



## Architectural role

Luồng quét scheduled pull nội bộ để tạo job inbound cho các project đã enable. Flow này là đơn vị trace cho trigger, participant, outcome và side effect kiến trúc.

## Boundaries respected

Participant chỉ đi qua owner/public API phù hợp; flow không chuyển ownership chỉ vì có orchestration hoặc side effect.

## Anti-patterns avoided

Không bypass owner state, không thực hiện side effect ngoài guardrail tương ứng và không biến flow thành mô tả payload/code-level detail.

## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Backlog/application/runScheduledPullScan.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-003-backlog-scheduled-pull/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
