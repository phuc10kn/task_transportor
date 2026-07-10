---
schema: entity-instance/v1
id: AF-001
slug: backlog-manual-pull
title: Backlog Manual Pull
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Luồng admin kéo một issue Backlog đơn lẻ vào hệ thống.
theory_basis:
  - TH-HUBFLOW-02
  - TH-CANON-01
relations:
  involves:
    - MOD-002
    - MOD-008
    - MOD-006
    - MOD-001
  changes:
    - SO-003
    - SO-001
---
# AF-001 - Backlog Manual Pull

## Summary

Luồng admin kéo một issue Backlog đơn lẻ vào hệ thống.

## Meaning

Luồng admin kéo một issue Backlog đơn lẻ vào hệ thống.

## Architectural role

Luồng admin kéo một issue Backlog đơn lẻ vào hệ thống. Flow này là đơn vị trace cho trigger, participant, outcome và side effect kiến trúc.

## Trigger

Admin gọi route pull issue theo project và backlog issue key.

## Path

`Admin -> Backlog HTTP -> BacklogApi -> SyncApi.enqueueJob(manual_pull) hoặc pull now -> BacklogClient -> normalizer -> CisApi.upsertBacklogIssue(...)`

## Why the path is shaped this way

- Request vào qua `Backlog` vì đây là source-specific boundary.
- Normalization ở `Backlog` để payload external không đi thẳng vào core.
- Write cuối cùng đi qua `CisApi` vì `Cis` là owner của canonical issue state.
- Có thể dùng job path nếu muốn retry/journal tốt hơn thay vì nhồi mọi thứ vào request lifecycle.

## Outcome

Canonical issue trong `Cis` được tạo hoặc cập nhật từ nguồn Backlog.

## Boundaries respected

Participant chỉ đi qua owner/public API phù hợp; flow không chuyển ownership chỉ vì có orchestration hoặc side effect.

## Anti-patterns avoided

Không bypass owner state, không thực hiện side effect ngoài guardrail tương ứng và không biến flow thành mô tả payload/code-level detail.

## Related Entities

- Canonical relation: [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md)
- Canonical relation: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md)
- Canonical relation: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- Context/evidence: [DF-001-backlog-to-cis-canonicalization](../../../05-data/data-flows/DF-001-backlog-to-cis-canonicalization/README.md)


## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Backlog/application/pullIssue.js`
- `src/modules/Backlog/application/handleManualPullJob.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
