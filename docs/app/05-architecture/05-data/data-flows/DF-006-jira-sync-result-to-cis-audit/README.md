---
schema: entity-instance/v1
id: DF-006
slug: jira-sync-result-to-cis-audit
title: Jira Sync Result To CIS Audit
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
summary: Luồng ghi Jira sync result và execution audit về canonical issue state cùng Sync journal.
theory_basis:
  - TH-SYNC-SAFE-03
  - TH-OPS-TRACE-01
relations:
  moves:
    - SO-001
    - SO-003
---
# DF-006 - Jira Sync Result To CIS Audit

## Summary

Luồng ghi Jira sync result và execution audit về canonical issue state cùng Sync journal.

## Meaning

Jira response sau outbound write được ghi về owner state nội bộ để CIS giữ sync status còn Sync giữ audit execution.

## Architectural role

Đây là feedback data flow từ external target về các owner nội bộ. Nó tách result/audit khỏi outbound payload data flow DF-004.

## Why this flow exists

- Outbound write chỉ reviewable và recoverable khi result quay về canonical state và journal.
- Jira transport không được trở thành source-of-truth của sync result trong app.

## Source / destination

- Source: Jira create/update result hoặc failure outcome của push job.
- Destination: canonical issue sync result trong `Cis` và `sync_journal` trong `Sync`.

## Data path

```text
Jira write result
  -> CisApi.saveJiraSyncResult(...) / sync status update
  -> SyncApi.writeJournal(...)
  -> canonical sync result + execution audit
```

## Transformation

External response được chuẩn hóa thành Jira key, sync status, selected result fields và audit action/message.

## Boundary and ownership

- `Cis` sở hữu canonical issue sync result.
- `Sync` sở hữu job/journal execution record.
- Jira chỉ là external source của result, không sở hữu state nội bộ.

## What changes and what does not

Flow cập nhật SO-001 và SO-003. Nó không sửa source payload, approved mapping hoặc ownership của Jira external issue.

## Read / write tiers involved

Jira worker trả result qua public API của `Cis` và `Sync`; write vẫn nằm tại owner module tương ứng.

## Anti-patterns avoided

Không coi Jira response là canonical state duy nhất hoặc bỏ journal khi outbound write hoàn tất/thất bại.

## Relations

`moves` ghi hai owner state đích nhận result và audit. External Jira source không có StateOwner local để ghi `shared_via`.

## Evidence

- `src/modules/Jira/application/handlePushIssueJob.js`
- `src/modules/Cis/application/saveJiraSyncResult.js`
- `src/modules/Sync/application/writeJournal.js`

## Related Entities

- Canonical relation: [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md) - sync result canonical
- Canonical relation: [SO-003-sync-execution-state](../../../04-state/state-owners/SO-003-sync-execution-state/README.md) - journal execution
- Context/evidence: [AF-007-cis-to-jira-sync](../../../03-interactions/interaction-flows/AF-007-cis-to-jira-sync/README.md) - interaction flow thực thi push

## Validation Notes

- Instance được tạo trong DataFlow rebuild theo DEC-002.
- Không tạo inverse edge chỉ để query đường từ StateOwner về DataFlow.
