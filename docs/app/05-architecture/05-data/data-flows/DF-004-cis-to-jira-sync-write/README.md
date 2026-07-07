---
id: DF-004
slug: cis-to-jira-sync-write
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
theory_basis:
  - TH-SYNC-SAFE-01
  - TH-SYNC-SAFE-03
  - TH-OPS-TRACE-01
---

# DF-004 - CIS To Jira Sync Write

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
  -> save sync result
  -> sync journal
```

## Transformation

Payload được map qua approved mapping rules, đi qua readiness checks, rồi được push qua job worker.

## Boundary and ownership

- `Cis` sở hữu source data.
- `Jira` sở hữu transport outbound và payload build.
- `Sync` sở hữu execution state và journal của flow.
- Không module nào được phép bỏ qua đường job/journal này để ghi Jira trực tiếp từ raw source.

## Architectural payoff

- Tách preview path khỏi write path.
- Cho phép retry, stale handling và audit độc lập với request lifecycle.
- Giữ outbound sync là kết quả của canonical state chứ không là side effect bám chặt vào inbound adapter.

## Evidence

- `src/modules/Jira/application/requestJiraSync.js`
- `src/modules/Jira/application/handlePushIssueJob.js`
- `src/modules/Cis/application/saveJiraSyncResult.js`
- `src/modules/Sync/application/writeJournal.js`

## Related Entities

- [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md) - source-of-truth nội bộ
- [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - outbound transport owner
- [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md) - execution owner
- [AF-007-cis-to-jira-sync](../../../03-interactions/interaction-flows/AF-007-cis-to-jira-sync/README.md) - interaction flow tương ứng
