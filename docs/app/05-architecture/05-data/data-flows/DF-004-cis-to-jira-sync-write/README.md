---
schema: entity-instance/v1
id: DF-004
slug: cis-to-jira-sync-write
title: CIS To Jira Sync Write
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
summary: Luồng chuyển canonical issue snapshot thành outbound write sang Jira thật.
theory_basis:
  - TH-SYNC-SAFE-01
  - TH-SYNC-SAFE-03
  - TH-OPS-TRACE-01
---
# DF-004 - CIS To Jira Sync Write

## Summary

Luồng chuyển canonical issue snapshot thành outbound write sang Jira thật.

## Meaning

Luồng chuyển canonical issue snapshot thành outbound write sang Jira thật.

## Architectural role

Đây là write flow từ canonical core ra external target. Nó là chặng cuối của pattern `System -> CIS -> System`.

## Why this flow exists

- `Cis` là source-of-truth nội bộ, nên outbound phải xuất phát từ đó.
- Việc sync thật cần tách khỏi dry-run để có job execution, retry và journal rõ ràng.

## Source / destination

- Source: canonical issue snapshot trong CIS
- Destination: Jira issue hoặc comment update

## Data path

```text
canonical issue snapshot
  -> readiness and mapping checks
  -> SyncApi.enqueueJob(push_issue / push_comment)
  -> Jira client write
```

## Transformation

Payload được map qua approved mapping rules, đi qua readiness checks, rồi được push qua job worker.

## Boundary and ownership

- `Cis` sở hữu source data.
- `Jira` sở hữu transport outbound và payload build.
- `Sync` điều phối job cho transport outbound, không chiếm ownership payload.
- Không module nào được phép bỏ qua đường job/journal này để ghi Jira trực tiếp từ raw source.
- Jira result feedback và journal là data flow riêng DF-006, không phải payload outbound này.

## Architectural payoff

- Tách preview path khỏi write path.
- Cho phép retry, stale handling và audit độc lập với request lifecycle.
- Giữ outbound sync là kết quả của canonical state chứ không là side effect bám chặt vào inbound adapter.



## What changes and what does not

Flow chỉ thay đổi hoặc truyền dữ liệu theo Data path và Transformation đã nêu; ownership không tự chuyển ngoài boundary được mô tả.

## Read / write tiers involved

Read/write đi qua owner API, orchestration hoặc worker path phù hợp; không dùng flow để hợp thức hóa cross-module write trực tiếp.

## Anti-patterns avoided

Không để external/raw payload trở thành canonical state, không bypass owner và không coi preview là outbound write.

## Relations

Flow này chỉ có StateOwner source được `shared_via` từ các owner. Destination là Jira external system nên không có `moves` tới StateOwner nội bộ.

## Evidence

- `src/modules/Jira/application/requestJiraSync.js`
- `src/modules/Jira/application/handlePushIssueJob.js`

## Related Entities

- Context/evidence: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md) - source-of-truth nội bộ
- Context/evidence: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - outbound transport owner
- Context/evidence: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md) - execution owner
- Context/evidence: [AF-007-cis-to-jira-sync](../../../03-interactions/interaction-flows/AF-007-cis-to-jira-sync/README.md) - interaction flow tương ứng

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
