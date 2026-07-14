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

`Admin -> JiraApi.requestJiraSync(...) -> resolve linked/trace target -> CisApi.prepareJiraSyncJob(H0/H1, optional trace link, H2, atomic enqueue+journal) -> worker -> JiraApi.handlePushIssueJob(...) -> final trace/hash recheck -> JiraClient -> CisApi.saveJiraSyncResult(CAS) -> SyncApi journal`

## Outcome

Jira chỉ được cập nhật khi dry-run hash, target provenance và worker hash còn hợp lệ; trace identity/job và sync result được bảo vệ bằng transaction/CAS, còn hệ thống nội bộ giữ audit trail.

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
- `src/modules/Cis/application/prepareJiraSyncJob.js`
- `src/modules/Cis/application/claimJiraIdentityForSync.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-007-cis-to-jira-sync/README.md`

## Validation Notes

- Không ghi inverse `participates_in`; reverse trace được suy ra từ relation `involves` của flow này.
- Evidence đã được refresh cho request-path trace cardinality, H0/H1/H2, atomic active-job enqueue và worker CAS guard; không thêm relation canonical mới.
