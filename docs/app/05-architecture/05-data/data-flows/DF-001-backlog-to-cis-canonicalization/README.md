---
schema: entity-instance/v1
id: DF-001
slug: backlog-to-cis-canonicalization
title: Backlog To CIS Canonicalization
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
summary: Luồng biến raw Backlog issue thành canonical issue state trong CIS.
theory_basis:
  - TH-HUBFLOW-02
  - TH-CANON-01
relations:
  moves:
    - SO-001
---
# DF-001 - Backlog To CIS Canonicalization

## Summary

Luồng biến raw Backlog issue thành canonical issue state trong CIS.

## Meaning

Luồng biến raw Backlog issue thành canonical issue state trong CIS.

## Architectural role

Đây là data flow nền của mô hình `System -> CIS -> System`. Nó cắt coupling trực tiếp giữa shape của Backlog và shape nội bộ mà toàn hệ thống dùng để review, sync và audit.

## Why this flow exists

- Backlog là source system, không phải canonical model của app.
- `Cis` cần một model ổn định hơn để phục vụ translation, dry-run, sync outbound và manual edit.
- Nếu không có bước canonicalization, các flow về sau sẽ bị kéo chặt vào payload và naming của Backlog.

## Source / destination

- Source: Backlog external payload
- Destination: canonical issue aggregates trong `Cis`

## Data path

```text
Backlog payload
  -> BacklogClient fetch
  -> normalizeBacklogIssue(...)
  -> CisApi.upsertBacklogIssue(...)
  -> issue / revision / related canonical state
```

## Transformation

Backlog payload được normalize và map về field shape nội bộ trước khi upsert vào `Cis`.

## Boundary and ownership

- `Backlog` sở hữu inbound adaptation, source fetch và normalization logic.
- `Cis` sở hữu owner write của canonical issue state sau khi dữ liệu đi qua boundary.
- Luồng này không chuyển ownership ngược từ `Cis` về `Backlog`.

## What changes and what does not

Flow chỉ thay đổi hoặc truyền dữ liệu theo Data path và Transformation đã nêu; ownership không tự chuyển ngoài boundary được mô tả.

## Read / write tiers involved

Read/write đi qua owner API, orchestration hoặc worker path phù hợp; không dùng flow để hợp thức hóa cross-module write trực tiếp.

## Architectural payoff

- Giảm phụ thuộc dây chuyền của `Translation`, `Jira` và `Dashboard` vào Backlog payload shape.
- Tạo điểm chuẩn để issue có thể được chỉnh tay, review và sync lại mà không cần quay về external source.
- Giữ đúng nguyên tắc inbound đi vào CIS thay vì mở đường `System -> System`.

## Failure and retry notes

- Với single pull nhỏ, flow có thể chạy ngay.
- Project pull và scheduled pull hiện không chạy; nếu được bật lại phải enqueue qua `Sync` để giữ retry và journal.
- Retry policy không nằm trong client fetch thuần, mà nằm ở flow orchestration hoặc worker path.

## Anti-patterns avoided

Không để external/raw payload trở thành canonical state, không bypass owner và không coi preview là outbound write.

## Relations

`moves` ghi state đích được canonical hóa. Backlog là external source nên không có StateOwner source để ghi `shared_via`.

## Evidence

- `src/modules/Backlog/support/normalizeBacklogIssue.js`
- `src/modules/Cis/application/upsertBacklogIssue.js`
- `src/modules/Backlog/application/pullIssue.js`
- `src/modules/Backlog/application/handleManualPullJob.js`

## Related Entities

- Context/evidence: [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md) - owner của inbound adaptation
- Context/evidence: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md) - owner của canonical issue state
- Context/evidence: [AF-001-backlog-manual-pull](../../../03-interactions/interaction-flows/AF-001-backlog-manual-pull/README.md) - flow thao tác đơn issue
- Context/evidence: [MB-001-cis-canonical-ownership](../../../02-boundaries/module-boundaries/MB-001-cis-canonical-ownership/README.md) - boundary write được bảo vệ

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
