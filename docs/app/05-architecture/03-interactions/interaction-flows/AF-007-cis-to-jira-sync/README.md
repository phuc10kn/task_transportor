---
schema: entity-instance/v1
id: AF-007
slug: cis-to-jira-sync
title: CIS To Jira Sync
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Thực thi outbound sync có kiểm soát từ canonical state của CIS sang Jira.
theory_basis:
  - TH-HUBFLOW-04
  - TH-SYNC-SAFE-03
  - TH-OPS-TRACE-01
relations:
  involves:
    - MOD-001
    - MOD-006
    - MOD-007
    - MOD-004
    - MOD-005
  changes:
    - SO-001
    - SO-003
    - SO-006
---

# AF-007 - CIS To Jira Sync

## Summary

Thực thi outbound sync có kiểm soát từ canonical state của CIS sang Jira.

## Meaning

Luồng outbound sync từ canonical issue state trong CIS sang Jira.

## Trigger

Admin yêu cầu sync hoặc worker tiếp tục thực thi push job đã enqueue.

## Path

`Admin or worker -> JiraApi.requestJiraSync(...) -> SyncApi.enqueueJob(push_issue) -> JiraApi.handlePushIssueJob(...) -> JiraClient -> CisApi.saveJiraSyncResult(...) -> SyncApi.writeJournal(...)`

## Outcome

Jira được cập nhật từ canonical snapshot, còn hệ thống nội bộ giữ audit trail và sync result.

## Related Entities

- Canonical relation: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md)
- Canonical relation: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- Canonical relation: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md)
- Context/evidence: [MB-006-jira-outbound-guardrail](../../../02-boundaries/module-boundaries/MB-006-jira-outbound-guardrail/README.md)


## Architectural role

Thực thi outbound sync có kiểm soát từ canonical state của CIS sang Jira. Flow này là đơn vị trace cho trigger, participant, outcome và side effect kiến trúc.

## Boundaries respected

Participant chỉ đi qua owner/public API phù hợp; flow không chuyển ownership chỉ vì có orchestration hoặc side effect.

## Anti-patterns avoided

Không bypass owner state, không thực hiện side effect ngoài guardrail tương ứng và không biến flow thành mô tả payload/code-level detail.

## Relations

- `involves`: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md), [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md), [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md), [MOD-004-mapping](../../../01-structure/modules/MOD-004-mapping/README.md), [MOD-005-anomaly](../../../01-structure/modules/MOD-005-anomaly/README.md).
- `changes`: [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md), [SO-003-sync-execution-state](../../../04-state/state-owners/SO-003-sync-execution-state/README.md) và [SO-006-anomaly-resolution-state](../../../04-state/state-owners/SO-006-anomaly-resolution-state/README.md) trong conflict branch.
- [MB-006-jira-outbound-guardrail](../../../02-boundaries/module-boundaries/MB-006-jira-outbound-guardrail/README.md) vẫn là prose context vì chưa có valid triple giữa `InteractionFlow` và `ModuleBoundary`.

## Evidence

- `src/modules/Jira/application/requestJiraSync.js`
- `src/modules/Jira/application/handlePushIssueJob.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-007-cis-to-jira-sync/README.md`

## Validation Notes

- Không ghi inverse `participates_in`; reverse trace được suy ra từ relation `involves` của flow này.
