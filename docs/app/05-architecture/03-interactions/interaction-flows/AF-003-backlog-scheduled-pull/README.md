---
schema: entity-instance/v1
id: AF-003
slug: backlog-scheduled-pull
title: Backlog Scheduled Pull
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Luồng scheduled pull được giữ làm trace nhưng execution hiện trả disabled và không tạo job.
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

Luồng scheduled pull được giữ làm trace nhưng execution hiện trả disabled và không tạo job.

## Meaning

Scheduled pull không hoạt động trong Lite hiện tại.

## Trigger

Internal caller có thể gọi scan nhưng nhận kết quả disabled.

## Path

`internal scheduler -> BacklogApi.runScheduledPullScan(...) -> disabled result`, không query source và không enqueue.

## Outcome

Trả `scanned_projects=0`, `results=[]` và reason `BACKLOG_PROJECT_PULL_DISABLED`.

## Related Entities

- Canonical relation: [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md)
- Canonical relation: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- Context/evidence: [SO-004-project-integration-state](../../../04-state/state-owners/SO-004-project-integration-state/README.md)



## Architectural role

Flow giữ provenance và disabled contract cho scheduled project pull.

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
