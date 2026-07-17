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
    - MOD-004
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

Admin gọi route Pull one hoặc một trong ba candidate action Sync to CIS/Translate/Jira theo project và issue key.

## Path

Candidate path: `Admin -> Backlog HTTP -> local readiness/CIS check -> SyncApi enqueue/reuse manual_pull -> HTTP 202 -> worker -> BacklogClient provider/project verification -> normalizer -> approved Backlog→CIS mapping lookup/apply -> CisApi.upsertBacklogIssue(...)`.

Jira branch tiếp tục trong cùng parent lifecycle: `translation staging children -> atomic batch approval -> Jira dry-run/gate -> push_issue child -> parent success`.

Pull-one compatibility path vẫn tạo `manual_pull` rồi chạy job ngay trong request hiện tại.

## Why the path is shaped this way

- Request vào qua `Backlog` vì đây là source-specific boundary.
- Normalization ở `Backlog` để payload external không đi thẳng vào core.
- Approved mapping được đọc qua public API của `Mapping` và áp dụng trước owner write; resync vì vậy có thể cập nhật lại canonical Issue type, Priority, Status và Assignee dù source payload không đổi.
- Write cuối cùng đi qua `CisApi` vì `Cis` là owner của canonical issue state.
- Candidate action luôn chốt queue trước khi gọi provider; reload đọc active job theo Project + Backlog key và không làm đứt execution của worker.
- Provider/project verification nằm trong worker để HTTP không giữ external request lifecycle và mọi failure được lưu trên job.
- Translation batch là all-or-nothing đối với canonical apply: một child terminal failure hủy sibling còn pending, giữ staging evidence, không đổi canonical và không gọi Jira.

## Outcome

Canonical issue trong `Cis` được tạo hoặc cập nhật từ nguồn Backlog.

## Boundaries respected

Participant chỉ đi qua owner/public API phù hợp; flow không chuyển ownership chỉ vì có orchestration hoặc side effect.

## Anti-patterns avoided

Không bypass owner state, không thực hiện side effect ngoài guardrail tương ứng và không biến flow thành mô tả payload/code-level detail.

## Related Entities

- Canonical relation: [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md)
- Canonical relation: [MOD-004-mapping](../../../01-structure/modules/MOD-004-mapping/README.md)
- Canonical relation: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md)
- Canonical relation: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- Context/evidence: [DF-001-backlog-to-cis-canonicalization](../../../05-data/data-flows/DF-001-backlog-to-cis-canonicalization/README.md)


## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Backlog/application/pullIssue.js`
- `src/modules/Backlog/application/handleManualPullJob.js`
- `src/modules/Backlog/support/applyBacklogMappings.js`
- `src/modules/Backlog/application/syncCandidateToCis.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Evidence đã được refresh cho per-row candidate enqueue/reuse shared manual-pull flow.
- Edge `AF-001 --involves--> MOD-004` materialize participant thực thi inbound approved mapping, dựa trên worker và mapping helper nêu trong Evidence.
- Không suy diễn relation canonical mới từ prose hiện có.
