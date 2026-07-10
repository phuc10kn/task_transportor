---
schema: entity-instance/v1
id: MOD-002
slug: backlog
title: Backlog
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Module integration inbound cho Backlog. Nó kéo dữ liệu từ Backlog, normalize về shape nội bộ và chuyển giao cho `Cis` hoặc `Sync`.
theory_basis:
  - TH-MOD-01
  - TH-MOD-04
---
# MOD-002 - Backlog

## Summary

Module integration inbound cho Backlog. Nó kéo dữ liệu từ Backlog, normalize về shape nội bộ và chuyển giao cho `Cis` hoặc `Sync`.

## Meaning

Module integration inbound cho Backlog. Nó kéo dữ liệu từ Backlog, normalize về shape nội bộ và chuyển giao cho `Cis` hoặc `Sync`.

## Architectural role

`Backlog` là inbound adapter module, không phải canonical owner. Nó đứng ở rìa hệ thống để hấp thụ khác biệt của source system và bảo vệ lõi `Cis` khỏi coupling trực tiếp với external payload.

## Responsibility

- Manual pull issue, project pull, scheduled pull scan.
- Pull mapping values phía Backlog.
- Download và retry attachment download.
- Đóng vai adapter inbound, không sở hữu canonical state.

## Why this module exists separately

- Giữ cho logic source-specific nằm ngoài canonical core.
- Cho phép thay đổi API Backlog, filter, attachment handling và normalization mà không kéo `Cis` đi theo.
- Tạo chỗ tự nhiên để quyết định khi nào chạy ngay, khi nào enqueue job.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Backlog/BacklogApi.js`, `src/modules/Backlog/http/routes.js` |
| External dependency | Backlog API |
| Main outbound | `CisApi.upsertBacklogIssue(...)`, `SyncApi.enqueueJob(...)` |
| Owned behavior | normalize inbound payload, inbound orchestration |
| Non-owned state | canonical issue state, sync execution state |

## Boundary notes

- `Backlog` được phép đọc source data bên ngoài và orchestrate inbound path.
- `Backlog` không được trở thành owner write của canonical issue tables.
- Khi flow nặng hoặc cần retry, nó chuyển execution sang `Sync` thay vì giữ toàn bộ logic trong request path.

## Rules / constraints

- Không tạo đường tắt `Backlog -> Jira`.
- Không giữ canonical issue ownership.
- Heavy pull path đi qua `Sync` khi cần retry hoặc batch processing.
- Source-specific shape phải dừng lại ở bước normalize, không được lan xuyên qua app.

## Anti-patterns avoided

- Dùng payload Backlog làm data model chung cho toàn app.
- Để external adapter tự quyết định business state nội bộ.
- Gắn outbound sync responsibility vào cùng module inbound chỉ vì cùng là integration.

## Evolution notes

- Nếu inbound volume tăng, `Backlog` có thể tách scheduler hoặc worker riêng mà không đổi owner của canonical state.
- Nếu có thêm webhook inbound, module này vẫn là nơi hợp lý để hấp thụ raw event trước khi qua `Cis`.

## Related Entities

- Context/evidence: [MOD-001-cis](../../modules/MOD-001-cis/README.md) - owner canonical issue state
- Context/evidence: [MOD-006-sync](../../modules/MOD-006-sync/README.md) - worker thực thi manual pull job
- Canonical relation: [AF-001-backlog-manual-pull](../../../03-interactions/interaction-flows/AF-001-backlog-manual-pull/README.md) - flow đơn issue
- Canonical relation: [AF-002-backlog-project-pull](../../../03-interactions/interaction-flows/AF-002-backlog-project-pull/README.md) - flow batch theo project
- Context/evidence: [DF-001-backlog-to-cis-canonicalization](../../../05-data/data-flows/DF-001-backlog-to-cis-canonicalization/README.md) - data flow lõi


## Relations

Chưa có outbound relation canonical trong baseline hiện tại. Prose liên quan được giữ làm context hoặc evidence; chỉ materialize theo DEC-002.

## Evidence

- `src/modules/Backlog/BacklogApi.js`
- `src/modules/Backlog/application/pullIssue.js`
- `src/modules/Backlog/application/pullProject.js`
- `src/modules/Backlog/application/runScheduledPullScan.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
