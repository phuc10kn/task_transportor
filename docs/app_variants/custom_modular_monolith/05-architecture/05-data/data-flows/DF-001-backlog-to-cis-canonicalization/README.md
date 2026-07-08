---
id: DF-001
slug: backlog-to-cis-canonicalization
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
---

# DF-001 - Backlog To CIS Canonicalization

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

- Thay đổi: canonical issue aggregates trong `Cis`.
- Không thay đổi: raw ownership của external issue bên Backlog.
- Không được phép xảy ra: `Backlog` tự viết trực tiếp vào canonical tables như owner riêng.

## Read / write tiers involved

- External read: Backlog source fetch.
- Tier 0 write: chỉ `Cis` được write canonical issue state.
- Tier 1 orchestration: `Backlog` được phép gọi owner API của `Cis`.

## Architectural payoff

- Giảm phụ thuộc dây chuyền của `Translation`, `Jira` và `Dashboard` vào Backlog payload shape.
- Tạo điểm chuẩn để issue có thể được chỉnh tay, review và sync lại mà không cần quay về external source.
- Giữ đúng nguyên tắc inbound đi vào CIS thay vì mở đường `System -> System`.

## Failure and retry notes

- Với single pull nhỏ, flow có thể chạy ngay.
- Với project pull hoặc scheduled pull, enqueue job qua `Sync` giúp retry và journal rõ hơn.
- Retry policy không nằm trong client fetch thuần, mà nằm ở flow orchestration hoặc worker path.

## Anti-patterns avoided

- Dùng raw Backlog payload làm model chạy xuyên toàn app.
- Cho `Jira` hoặc `Translation` đọc trực tiếp external payload thay vì canonical state.
- Cho module integration chiếm owner write của state nội bộ.

## Evidence

- `src/modules/Backlog/support/normalizeBacklogIssue.js`
- `src/modules/Cis/application/upsertBacklogIssue.js`
- `src/modules/Backlog/application/pullIssue.js`
- `src/modules/Backlog/application/handleManualPullJob.js`

## Related Entities

- [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md) - owner của inbound adaptation
- [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md) - owner của canonical issue state
- [AF-001-backlog-manual-pull](../../../03-interactions/interaction-flows/AF-001-backlog-manual-pull/README.md) - flow thao tác đơn issue
- [MB-001-cis-canonical-ownership](../../../02-boundaries/module-boundaries/MB-001-cis-canonical-ownership/README.md) - boundary write được bảo vệ
