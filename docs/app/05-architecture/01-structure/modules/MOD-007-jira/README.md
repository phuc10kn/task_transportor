---
schema: entity-instance/v1
id: MOD-007
slug: jira
title: Jira
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Thực thi Jira dry-run và outbound sync có kiểm soát.
theory_basis:
  - TH-MOD-01
  - TH-MOD-04
  - TH-MOD-06
  - TH-HUBFLOW-04
  - TH-SYNC-SAFE-01
  - TH-SYNC-SAFE-02
  - TH-SYNC-SAFE-03
---

# MOD-007 - Jira

## Summary

Thực thi Jira dry-run và outbound sync có kiểm soát.

## Meaning

Module integration outbound cho Jira. Nó build dry-run preview, kiểm readiness, enqueue sync thật và thực hiện push issue/comment qua Jira client.

## Responsibility

- Pull Jira mapping values.
- Build payload dry-run từ canonical issue snapshot.
- Đánh giá readiness trước khi sync.
- Thực thi `push_issue` và `push_comment` job.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Jira/JiraApi.js`, `src/modules/Jira/http/routes.js` |
| External dependency | Jira API |
| Main inbound | admin sync request, worker job |
| Main consumers | `Cis`, `Projects`, `Mapping`, `Anomaly`, `Sync` |

## Rules / constraints

- Outbound write phải đi theo đường `CIS -> Jira`, không sync trực tiếp từ Backlog.
- Dry-run và readiness phải đi trước sync thật.
- Jira không trở thành owner của canonical issue state nội bộ.

## Related Entities

- Context/evidence: [MOD-001-cis](../../modules/MOD-001-cis/README.md) - nguồn snapshot canonical
- Context/evidence: [MOD-004-mapping](../../modules/MOD-004-mapping/README.md) - approved mapping lookup
- Context/evidence: [MOD-005-anomaly](../../modules/MOD-005-anomaly/README.md) - blocking anomaly gate
- Context/evidence: [MOD-006-sync](../../modules/MOD-006-sync/README.md) - enqueue và worker execution
- Canonical relation: [MB-006-jira-outbound-guardrail](../../../02-boundaries/module-boundaries/MB-006-jira-outbound-guardrail/README.md) - guardrail outbound

## Relations

Chưa có outbound relation canonical trong baseline hiện tại. Prose liên quan được giữ làm context hoặc evidence; chỉ materialize theo DEC-002.

## Evidence

- `src/modules/Jira/JiraApi.js`
- `src/modules/Jira/application/runJiraDryRun.js`
- `src/modules/Jira/application/requestJiraSync.js`
- `src/modules/Jira/application/handlePushIssueJob.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
