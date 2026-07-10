---
schema: entity-instance/v1
id: SO-003
slug: sync-execution-state
title: Sync Execution State
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
summary: State job, retry, worker progress và journal do Sync sở hữu.
theory_basis:
  - TH-OPS-TRACE-01
  - TH-OPS-TRACE-02
  - TH-OPS-TRACE-05
---

# SO-003 - Sync Execution State

## Summary

State của job, retry, worker progress và journal do Sync sở hữu.

## Meaning

State của hàng đợi job nội bộ, retry, worker progress và journal execution.

## Owner

`Sync`

## Reason

Execution state phải tập trung để worker retry và audit có thể hoạt động nhất quán, nhưng nó vẫn tách khỏi business state.

## Write policy

- `Sync` write `sync_jobs`, `sync_journal`.
- Module khác enqueue hoặc yêu cầu retry qua `SyncApi`.

## Consumers

- `Dashboard`
- `Jira`
- admin operations


## Why this state is central

State job, retry, worker progress và journal do Sync sở hữu. Ownership phải rõ để consumer không ghi trực tiếp hoặc suy diễn shared ownership.

## What belongs to this state

State, lifecycle và record do Owner nêu trong Meaning/Write policy quản lý thuộc instance này.

## What does not belong here

Business state của module khác, transport detail và state không do Owner quản lý không thuộc instance này.

## Architectural implications

Consumer đọc hoặc yêu cầu thay đổi qua public API/owner path; runtime hoặc shared storage không làm thay đổi ownership.

## Relations

Chưa có outbound relation canonical trong baseline hiện tại. Prose liên quan được giữ làm context hoặc evidence; chỉ materialize theo DEC-002.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Sync/SyncApi.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
