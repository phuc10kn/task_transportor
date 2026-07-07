---
id: DF-003
slug: cis-to-jira-dry-run-preview
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
theory_basis:
  - TH-MOD-06
---

# DF-003 - CIS To Jira Dry Run Preview

## Meaning

Luồng dựng preview payload Jira từ canonical issue snapshot mà chưa ghi ra ngoài.

## Architectural role

Đây là snapshot-read flow phục vụ decision và validation, không phải write flow.

## Why this flow exists

- Outbound sync sang Jira cần preview trước khi ghi thật.
- Mapping gap, anomaly hoặc config lỗi cần được lộ ra sớm.
- Người vận hành cần thấy payload build từ canonical state chứ không phải từ external source raw.

## Source / destination

- Source: issue snapshot, revisions, comments, attachments, translation state, project config
- Destination: dry-run preview result

## Data path

```text
canonical issue snapshot
  + translation state
  + project config
  + mapping rules
  + anomaly checks
  -> Jira dry-run preview
```

## Transformation

`Jira` tổng hợp snapshot từ nhiều owner read-allowlist rồi build payload preview và readiness diagnostics.

## Boundary and ownership

- Đây là Tier 3 outbound snapshot read.
- `Jira` không lấy ownership của issue, translation, project hay mapping state.
- Read exception có kiểm soát được dùng để build preview.

## Architectural payoff

- Cho phép xác nhận readiness trước write thật.
- Làm lộ coupling outbound ở dạng reviewable thay vì hidden inside push job.
- Giữ guardrail giữa canonical core và target system write path.

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `docs/app/05-architecture/02-boundaries/README.md`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-006-jira-dry-run/README.md`

## Related Entities

- [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - consumer của snapshot
- [MB-003-read-allowlist](../../../02-boundaries/module-boundaries/MB-003-read-allowlist/README.md) - read exception được dùng
- [CCR-004-dry-run-before-jira-write](../../../07-cross-cutting/cross-cutting-rules/CCR-004-dry-run-before-jira-write/README.md) - guardrail cắt ngang
