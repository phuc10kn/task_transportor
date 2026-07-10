---
schema: entity-instance/v1
id: AF-006
slug: jira-dry-run
title: Jira Dry Run
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Preview payload outbound và readiness trước khi ghi Jira thật.
theory_basis:
  - TH-SYNC-SAFE-02
  - TH-SYNC-SAFE-03
  - TH-CANON-01
relations:
  involves:
    - MOD-007
    - MOD-001
    - MOD-004
    - MOD-005
    - MOD-006
  changes:
    - SO-003
    - SO-006
---

# AF-006 - Jira Dry Run

## Summary

Preview outbound payload và readiness trước khi ghi Jira thật.

## Meaning

Luồng preview outbound payload sang Jira mà chưa ghi thật.

## Trigger

Admin gọi route dry-run theo issue.

## Path

`Admin -> Jira HTTP -> JiraApi.runJiraDryRun(...) -> read canonical snapshot -> MappingApi -> AnomalyApi -> build payload preview`

## Outcome

User nhận preview payload và readiness signal trước khi sync thật.

## Related Entities

- Canonical relation: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md)
- Canonical relation: [MOD-004-mapping](../../../01-structure/modules/MOD-004-mapping/README.md)
- Canonical relation: [MOD-005-anomaly](../../../01-structure/modules/MOD-005-anomaly/README.md)


## Architectural role

Preview payload outbound và readiness trước khi ghi Jira thật. Flow này là đơn vị trace cho trigger, participant, outcome và side effect kiến trúc.

## Boundaries respected

Participant chỉ đi qua owner/public API phù hợp; flow không chuyển ownership chỉ vì có orchestration hoặc side effect.

## Anti-patterns avoided

Không bypass owner state, không thực hiện side effect ngoài guardrail tương ứng và không biến flow thành mô tả payload/code-level detail.

## Relations

- `involves`: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md), [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md), [MOD-004-mapping](../../../01-structure/modules/MOD-004-mapping/README.md), [MOD-005-anomaly](../../../01-structure/modules/MOD-005-anomaly/README.md), [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md).
- `changes`: [SO-003-sync-execution-state](../../../04-state/state-owners/SO-003-sync-execution-state/README.md) qua dry-run journal và [SO-006-anomaly-resolution-state](../../../04-state/state-owners/SO-006-anomaly-resolution-state/README.md) khi mapping gap tạo anomaly.
- Không ghi inverse `participates_in`; reverse trace được suy ra từ relation `involves` của flow này.

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-006-jira-dry-run/README.md`

## Validation Notes

- Cả ba module là participant được nêu trực tiếp trong path và related entities của flow.
