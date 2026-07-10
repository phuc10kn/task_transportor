---
schema: entity-instance/v1
id: DF-003
slug: cis-to-jira-dry-run-preview
title: CIS To Jira Dry Run Preview
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
summary: Luồng dựng preview payload Jira từ canonical issue snapshot mà chưa ghi ra ngoài.
theory_basis:
  - TH-SYNC-SAFE-02
  - TH-SYNC-SAFE-04
---
# DF-003 - CIS To Jira Dry Run Preview

## Summary

Luồng dựng preview payload Jira từ canonical issue snapshot mà chưa ghi ra ngoài.

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



## What changes and what does not

Flow chỉ thay đổi hoặc truyền dữ liệu theo Data path và Transformation đã nêu; ownership không tự chuyển ngoài boundary được mô tả.

## Read / write tiers involved

Read/write đi qua owner API, orchestration hoặc worker path phù hợp; không dùng flow để hợp thức hóa cross-module write trực tiếp.

## Anti-patterns avoided

Không để external/raw payload trở thành canonical state, không bypass owner và không coi preview là outbound write.

## Relations

Dry-run preview không ghi StateOwner đích. Các state input ghi `shared_via` tới flow này; journal execution vẫn được trace ở `AF-006 --changes--> SO-003`.

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `docs/app/05-architecture/02-boundaries/README.md`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-006-jira-dry-run/README.md`

## Related Entities

- Context/evidence: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - consumer của snapshot
- Context/evidence: [MB-003-read-allowlist](../../../02-boundaries/module-boundaries/MB-003-read-allowlist/README.md) - read exception được dùng
- Context/evidence: [CCR-004-dry-run-before-jira-write](../../../07-cross-cutting/cross-cutting-rules/CCR-004-dry-run-before-jira-write/README.md) - guardrail cắt ngang

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
